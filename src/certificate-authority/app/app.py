import os
import secrets
import uuid
import argon2
from flask import redirect
from quart_auth import (
    AuthUser,
    QuartAuth,
    current_user,
    login_required,
    login_user,
    logout_user,
)
from quart_cors import cors
from quart import (
    Blueprint,
    Quart,
    current_app,
    jsonify,
    render_template,
    request,
    session,
    url_for,
)
from app import db
from app import signing
from cryptography.hazmat.primitives import serialization

app = Quart(__name__)
main = Blueprint("main", __name__)
app.config["MAX_CONTENT_LENGTH"] = 50 * 1024 * 1024
app.secret_key = secrets.token_urlsafe(16)
app = cors(
    app,
    allow_origin=[
        "https://wallet-frontend.wallet.test",
        "https://wallet-backend.wallet.test",
    ],
    allow_methods=["POST", "OPTIONS", "GET"],
    allow_headers=["Content-Type", "Authorization"],
)
QuartAuth(app)


@app.before_serving
async def startup():
    app.db_engine = await db.init_db()
    app.blob_dir = "app/keys"
    os.makedirs(app.blob_dir, exist_ok=True)

    cert_info = signing.load_cert_info()

    app.private_key = cert_info[0]
    app.public_key = cert_info[1]
    app.cert = cert_info[2]


@app.after_serving
async def shutdown():
    await app.db_engine.dispose()


@app.route("/")
async def index():
    return redirect(url_for("login"))


@app.route("/login", methods=["GET", "POST"])
async def login():
    if await current_user.is_authenticated:
        return redirect(url_for("dashboard"))
    else:
        session.clear()

    form = await request.form
    username = form.get("username")
    password = form.get("password")

    if username is None or password is None:
        error = None
        return await render_template("login.html", error=error)

    user = await db.get_user(current_app.db_engine, username)

    if user is None:
        error = "Invalid username or password"
        return await render_template("login.html", error=error)

    hasher = argon2.PasswordHasher()
    try:
        hasher.verify(user["password_hash"], password)
    except Exception:
        error = "Invalid username or password"
        return await render_template("login.html", error=error)

    login_user(AuthUser(username))
    return redirect(url_for("dashboard"))


@app.route("/logout")
async def logout():
    logout_user()
    return redirect(url_for("login"))


@app.route("/dashboard")
@login_required
async def dashboard():
    return await render_template("dashboard.html")


signing_uuids = dict()


@app.route("/get_sign_url")
@login_required
async def get_sign_url():
    username = current_user.auth_id

    if username not in signing_uuids:
        signing_uuids[username] = str(uuid.uuid4())

    return await render_template("dashboard.html", uuid=signing_uuids[username])


def contains_uuid(id):
    for k, v in signing_uuids.values():
        if v == id:
            return True
    return False


@app.route("/api/get_ca_cert")
async def get_ca_cert():
    cert_text = app.cert.public_bytes(encoding=serialization.Encoding.PEM)

    return cert_text, 200


@app.route("/api/sign/<id>", methods=["POST"])
async def sign(id):
    if not contains_uuid(id):
        return "Invalid signing request ID", 401

    signing_uuids = {k: v for k, v in signing_uuids.items() if v != id}

    req = await request.get_json()
    if req is None or "csr" not in req:
        return "Malformed certificate signing request", 400

    try:
        cert_pem = signing.handle_csr(req["csr"], app.private_key, app.cert)
        if cert_pem is None:
            return "Invalid certificate signing request", 400
    except Exception as e:
        print(e)
        return "Internal Server Error", 500

    return jsonify({"crt": cert_pem}), 200


if __name__ == "__main__":
    app.run()
