from functools import partial
from quart import request, session, redirect, url_for, render_template, jsonify, Blueprint
from quart_cors import cors
import hashlib
import urllib.parse
import pyotp
import json

from utils import create_url, generate_pid

MAIN_DOMAIN = 'pid-provider.wallet.test'
PUBLIC_DOMAIN = 'public.pid-provider.wallet.test'


def register_routes(app, db):
    main = Blueprint('main', __name__)
    public = Blueprint('public', __name__)

    cors(public, allow_origin="*")

    main_route = partial(main.route, host=MAIN_DOMAIN)
    public_route = partial(public.route, host=PUBLIC_DOMAIN)

    @main_route('/')
    async def index():
        return redirect(url_for('main.login'))

    @main_route('/login', methods=['GET', 'POST'])
    async def login():
        if request.method == 'GET':
            # Checks if the user is already logged in
            if session.get('totp_authenticated'):
                # Checks if the session has parameters to generate PID,
                # if not, redirect to dashboard
                if 'generate_state' in session:
                    return redirect(url_for('main.create_pid', **session['generate_state']))
                return redirect(url_for('main.dashboard'))

            # If not logged in, clear the session but keep generate_state to generate the PID
            if not session.get('totp_authenticated'):
                gen_state = session.get('generate_state')
                session.clear()
                if gen_state:
                    session['generate_state'] = gen_state

        error = None

        if request.method == 'POST':
            form = await request.form
            pan = form.get('personal_administrative_number')

            if pan:
                # Fetches the citizen from the database by personal ID
                async with db.connection() as conn:
                    record = await conn.fetch_first(
                        "SELECT * FROM citizens WHERE personal_administrative_number = :pan",
                        {"pan": pan}
                    )
                if record:
                    # On successful fetch, stores Personal ID in session
                    session['pan'] = pan

                    # If request to generate PID exists, binds Personal ID to parameters
                    if 'generate_state' in session:
                        session['generate_state']['target_pan'] = pan
                    return redirect(url_for('main.verify_totp'))
                error = "Citizen not found"

        return await render_template('login.html', error=error)

    @main_route('/totp/verify', methods=['GET', 'POST'])
    async def verify_totp():
        # Gets Personal ID from session
        pan = session.get('pan')
        if not pan:
            return redirect(url_for('main.login'))

        error = None
        if request.method == 'POST':
            form = await request.form
            user_code = form.get('code')

            # Fetches 2FA secret by users Personal ID
            async with db.connection() as conn:
                record = await conn.fetch_first(
                    "SELECT totp_secret FROM citizens WHERE personal_administrative_number = :pan",
                    {"pan": pan}
                )

            if record and record['totp_secret']:
                # Verifies 2FA code and stores authenticated status in session
                totp = pyotp.TOTP(record['totp_secret'])
                if totp.verify(user_code, valid_window=1):
                    session['totp_authenticated'] = True

                    # If it's a request to generate PID, redirects to generate PID
                    if 'generate_state' in session:
                        gen_state = session.get('generate_state')
                        return redirect(url_for('main.create_pid', **gen_state))

                    # Otherwise, redirects to dashboard
                    return redirect(url_for('main.dashboard'))
                # If code is wrong
                error = "Invalid code."
            else:
                # If user has no 2FA code in the database
                error = "No 2FA configured."

        return await render_template('verify_totp.html', error=error)

    @main_route('/logout')
    async def logout():
        session.clear()
        return redirect(url_for('main.login'))

    @main_route('/dashboard')
    async def dashboard():
        # If the user is not logged in
        pan = session.get('pan')
        if not pan or not session.get('totp_authenticated'):
            return redirect(url_for('main.login'))

        # URI for QR code
        offer_uri = await create_url(db, pan)

        # Fetches the citizen from the database by personal ID
        async with db.connection() as conn:
            record = await conn.fetch_first("SELECT * FROM citizens WHERE personal_administrative_number = :pan", {"pan": pan})

        return await render_template('dashboard.html', citizen=dict(record), offer_uri=offer_uri)

    @main_route('/api/refresh-qr', methods=['GET'])
    async def refresh_qr():
        pan = session.get('pan')
        if not pan or not session.get('totp_authenticated'):
            return jsonify({"error": "Unauthorized"}), 401

        offer_uri = await create_url(db, pan)

        return jsonify({"offer_uri": offer_uri})

    @main_route('/api/request-pid', methods=['GET'])
    async def create_pid():

        # Arguments from URL
        pub_key = request.args.get('pub_key')
        passkey = request.args.get('passkey')
        redirect_uri = request.args.get('redirect_uri')

        if not all([pub_key, passkey, redirect_uri]):
            return jsonify({"error": "Missing parameters"}), 400

        pan = session.get('pan')
        totp_ok = session.get('totp_authenticated')
        gen_state = session.get('generate_state')

        # Checks if the person logged in is the one allowed for this session
        if gen_state and gen_state.get('target_pan') and gen_state.get('target_pan') != pan:
            session.clear()
            return jsonify({"error": "Identity mismatch"}), 403

        # Stores URL parameters in session if not logged in
        if not pan or not totp_ok:
            session['generate_state'] = {
                'pub_key': pub_key, 'passkey': passkey, 'redirect_uri': redirect_uri
            }
            return redirect(url_for('main.login'))

        try:
            await generate_pid(db, app, session.get('pan'), pub_key, passkey)

            # Clear generate_state if it was set
            session.pop('generate_state', None)

            return redirect(redirect_uri)
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @public_route('/api/request-pid-code', methods=['POST', 'OPTIONS'])
    async def create_pid_code():
        if request.method == 'OPTIONS':
            return jsonify({"success": True}), 200

        data = await request.get_json()
        if not data:
            return jsonify({"error": "Missing JSON body"}), 400

        code = data.get('code')
        pub_key = data.get('pub_key')
        passkey = data.get('passkey')

        # If public key is of dictionary type, convert it to a string
        # because in generate_pid() it comes as a string
        if isinstance(pub_key, dict):
            pub_key = urllib.parse.quote(json.dumps(pub_key))

        if not all([code, pub_key, passkey]):
            return jsonify({"error": "Missing parameters"}), 400

        async with db.connection() as conn:
            record = await conn.fetch_first(
                "SELECT pan FROM issuance_codes WHERE code = :code AND created_at >= NOW() - INTERVAL '2 minutes'",
                {"code": code}
            )
            if not record:
                return jsonify({"error": "Invalid or expired code"}), 400

            code_pan = record['pan']
            await conn.execute("DELETE FROM issuance_codes WHERE code = :code", {"code": code})

        try:
            await generate_pid(db, app, code_pan, pub_key, passkey)
            return jsonify({"success": True})
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @public_route('/api/receive-pid', methods=['POST', 'OPTIONS'])
    async def issue_pid():
        if request.method == 'OPTIONS':
            return jsonify({"success": True}), 200
        data = await request.get_json()
        passkey = data.get('passkey')
        hashed_passkey = hashlib.sha256(passkey.encode()).hexdigest()
        # Fetches the token by the hashed passkey
        async with db.connection() as conn:
            record = await conn.fetch_first("SELECT sd_jwt FROM issued_pids WHERE passkey = :passkey AND created_at >= NOW() - INTERVAL '2 minutes'", {"passkey": hashed_passkey})
            # If token is found, delete it from database and return it
            if record:
                await conn.execute("DELETE FROM issued_pids WHERE passkey = :passkey", {"passkey": hashed_passkey})
                return jsonify({"pid": record['sd_jwt']})
        # If token is not found
        return jsonify({"error": "passkey doesn't match or expired"}), 404

    @public_route('/.well-known/credential-issuer', methods=['GET'])
    async def credential_issuer_metadata():
        metadata = {
            "credential_issuer": f"https://{MAIN_DOMAIN}",
            "credential_endpoint": f"https://{PUBLIC_DOMAIN}/api/request-pid-code",
            "credential_configurations_supported": {
                "eu.europa.ec.eudi.pid": {
                    "format": "sd-jwt",
                    "cryptographic_binding_methods_supported": ["jwk"],
                    "credential_signing_alg_values_supported": ["ES256"],
                    "claims": {
                        "given_name": {}, "family_name": {}, "birth_date": {},
                        "birth_place": {}, "nationality": {},
                        "resident_address": {}, "resident_country": {},
                        "resident_state": {}, "resident_city": {},
                        "resident_postal_code": {}, "resident_street": {},
                        "resident_house_number": {}, "sex": {}, "email_address": {}
                    }
                }
            }
        }
        return jsonify(metadata)

    @public_route('/api/credential-offer/<code>', methods=['GET'])
    async def credential_offer(code):
        async with db.connection() as conn:
            record = await conn.fetch_first(
                "SELECT pan FROM issuance_codes WHERE code = :code AND created_at >= NOW() - INTERVAL '2 minutes'",
                {"code": code}
            )
        if not record:
            return jsonify({"error": "Invalid or expired code"}), 404

        offer = {
            "credential_issuer": f"https://{PUBLIC_DOMAIN}",
            "credential_configuration_ids": ["eu.europa.ec.eudi.pid"],
            "grants": {
                "urn:ietf:params:oauth:grant-type:pre-authorized_code": {
                    "pre-authorized_code": code
                }
            }
        }
        return jsonify(offer)

    app.register_blueprint(main)
    app.register_blueprint(public)
