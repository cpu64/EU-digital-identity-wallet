import os
import time
from quart import Quart, jsonify
from quart_db import QuartDB
from jwcrypto import jwk
from sd_jwt.issuer import SDJWTIssuer
from sd_jwt.common import SDObj

PGUSER = os.getenv('PGUSER', 'postgres')
PGPASSWORD = os.getenv('PGPASSWORD', 'password')
PGHOST = os.getenv('PGHOST', 'pid-db')
PGPORT = os.getenv('PGPORT', '5432')
PGDATABASE = os.getenv('PGDATABASE', 'piddb')

DB_URL = f"postgresql://{PGUSER}:{PGPASSWORD}@{PGHOST}:{PGPORT}/{PGDATABASE}"

app = Quart(__name__)
db = QuartDB(app, url=DB_URL)

# Currently generates new issuer key every time
issuer_key = jwk.JWK.generate(kty='EC', crv='P-256', kid='issuer-key')

# No interaction with the wallet, so generates holder's key aswell
holder_key = jwk.JWK.generate(kty='EC', crv='P-256', kid='holder-key')


# Temporal GET endpoint while no authentication
@app.route('/issue/<personal_administrative_number>')
async def issue_sd_jwt(personal_administrative_number):
    query = "SELECT * FROM citizens " \
        "WHERE personal_administrative_number = :pan"

    try:
        async with db.connection() as conn:
            record = await conn.fetch_first(
                query,
                {"pan": personal_administrative_number}
            )

    except Exception as e:
        return jsonify({"error": "Database error", "details": str(e)}), 500

    if not record:
        return jsonify({"error": "Citizen not found"}), 404

    citizen_data = dict(record)

    # Mandatory (and some optional) attributes according to
    # https://github.com/eu-digital-identity-wallet/eudi-doc-attestation-rulebooks-catalog/blob/main/rulebooks/pid/pid-rulebook.md#2-pid-attributes-and-metadata

    # Attributes wrapped in SDObj are Selective Disclose Objects, and are
    # hashed individually. This allows the wallet user to prove individual
    # facts

    user_claims = {
        SDObj("given_name"): citizen_data["given_name"],
        SDObj("family_name"): citizen_data["family_name"],
        SDObj("birth_date"): str(citizen_data["birth_date"]),
        SDObj("birth_place"): citizen_data["birth_place"],
        SDObj("nationality"): citizen_data["nationality"],
        SDObj("resident_address"): citizen_data["resident_address"],
        SDObj("resident_country"): citizen_data["resident_country"],
        SDObj("resident_state"): citizen_data["resident_state"],
        SDObj("resident_city"): citizen_data["resident_city"],
        SDObj("resident_postal_code"): citizen_data["resident_postal_code"],
        SDObj("resident_street"): citizen_data["resident_street"],
        SDObj("resident_house_number"): citizen_data["resident_house_number"],
        SDObj("sex"): citizen_data["sex"],
        "issuing_authority": "Nacionalinis Gyventojų Registras",
        "issuing_country": "LT",
        "iss": "https://pid-provider.wallet.test",
        "iat": int(time.time()),
        "exp": int(time.time()) + (60*60*24*120),
    }

    try:
        # Initialize Issuer
        issuer = SDJWTIssuer(
            user_claims=user_claims,
            issuer_key=issuer_key,
            holder_key=holder_key,
            sign_alg="ES256"
        )

        # Token Signing
        token = issuer.sd_jwt_issuance

        return jsonify({"sd_jwt": token}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
