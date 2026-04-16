import os
import secrets
import argon2
from app import db
from app import totp
from quart import Response, jsonify, Quart, current_app, request
from quart_auth import QuartAuth, login_required, current_user
from quart_cors import cors

app = Quart(__name__)
app.config["QUART_AUTH_MODE"] = "bearer"
app.secret_key = secrets.token_urlsafe(16)
app = cors(
    app,
    allow_origin=["https://wallet-frontend.wallet.test"],
    allow_methods=["POST", "OPTIONS", "GET"],
    allow_headers=["Content-Type", "Authorization"],
)
auth = QuartAuth(app)


@app.before_serving
async def startup():
    app.db_engine = await db.init_db()
    app.blob_dir = "blob"
    os.makedirs(app.blob_dir, exist_ok=True)


@app.after_serving
async def shutdown():
    await app.db_engine.dispose()


def is_user_request_valid(req):
    return (
        req is not None
        and "username" in req
        and "password" in req
        and isinstance(req["username"], str)
        and isinstance(req["password"], str)
    )


def is_blob_request_valid(req):
    return req is not None and "blob" in req and isinstance(req["blob"], str)


@app.route("/api/register", methods=["POST"])
async def register():
    req = await request.get_json()

    if not is_user_request_valid(req):
        return jsonify({"success": False, "status": "Invalid input JSON"}), 400

    if (not req["username"].isalnum()) or (len(req["username"]) < 6):
        return (
            jsonify(
                {
                    "success": False,
                    "status": "Username is invalid \
                        (must be an alphanumeric string of at least 6 characters)",
                }
            ),
            400,
        )

    if len(req["password"]) < 6:
        return (
            jsonify(
                {
                    "success": False,
                    "status": "Password is invalid \
                        (must be a string of at least 6 characters)",
                }
            ),
            400,
        )

    hasher = argon2.PasswordHasher()
    password_hash = hasher.hash(req["password"])

    try:
        if await db.get_user(current_app.db_engine, req["username"]) is not None:
            return (
                jsonify(
                    {
                        "success": False,
                        "status": "Username is taken",
                    }
                ),
                400,
            )

        if req["totp"] is None:
            req["totp"] = ""

        await db.create_user(
            current_app.db_engine, req["username"], password_hash, req["totp"]
        )
    except Exception as e:
        print(type(e))
        print(e.args)
        print(e)
        return (
            jsonify(
                {
                    "success": False,
                    "status": "Internal server error",
                }
            ),
            500,
        )

    return jsonify({"success": True, "Status": "User created successfully"})


@app.route("/api/login", methods=["POST"])
async def login():
    req = await request.get_json()

    if not is_user_request_valid(req):
        return jsonify({"error": "Invalid input JSON"}), 400

    user = await db.get_user(current_app.db_engine, req["username"])

    if user is None:
        return jsonify({"error": "Invalid username"}), 400

    hasher = argon2.PasswordHasher()

    try:
        hasher.verify(user["password_hash"], req["password"])
    except Exception:
        return jsonify({"error": "Invalid password"}), 400

    if user["totp"] and user["totp"] != "":
        secret = user["totp"]
        user_totp = req["totp"]

        if user_totp is None or not user_totp.isdigit() or len(user_totp) != 6:
            return jsonify({"error": "Malformed TOTP code"}), 400

        try:
            totp_result = totp.verify_totp(user_totp, secret)
        except Exception as e:
            return (
                jsonify(
                    {"error": "Internal server error - failed to verify TOTP code"}
                ),
                500,
            )

        if not totp_result:
            return jsonify({"error": "Invalid or expired TOTP code"}), 400

    token = auth.dump_token(user["username"])
    return jsonify({"token": token})


@app.route("/api/get_blob", methods=["GET"])
@login_required
async def get_blob():
    username = current_user.auth_id

    try:
        blob = await db.get_blob(current_app.db_engine, username, current_app.blob_dir)
        return jsonify({"blob": blob})
    except Exception:
        return Response(status=500)


@app.route("/api/store_blob", methods=["POST"])
@login_required
async def store_blob():
    username = current_user.auth_id
    req = await request.get_json()

    if not is_blob_request_valid(req):
        return jsonify({"success": False, "status": "Invalid input JSON"}), 400

    try:
        await db.write_blob(
            current_app.db_engine, username, current_app.blob_dir, req["blob"]
        )

        return jsonify({"success": True, "status": "Blob stored successfully"})
    except Exception:
        return jsonify({"success": False, "status": "Failed to store blob"}), 500


if __name__ == "__main__":
    app.run()
