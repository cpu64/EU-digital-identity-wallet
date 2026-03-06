import secrets
import argon2
from app import db
from quart import jsonify, Quart, current_app, request
from quart_auth import QuartAuth

app = Quart(__name__)
app.config["QUART_AUTH_MODE"] = "bearer"
app.secret_key = secrets.token_urlsafe(16)
auth = QuartAuth(app)

@app.before_serving
async def startup():
    app.db_engine = await db.init_db()

@app.after_serving
async def shutdown():
    await app.db_engine.dispose()

def is_user_request_valid(req):
    return req is not None and "username" in req and "password" in req

@app.route("/api/register", methods=["POST"])
async def register():
    req = await request.get_json()

    if not is_user_request_valid(req):
        return jsonify({"success": False, "status": "Invalid input JSON"}), 400

    hasher = argon2.PasswordHasher()
    password_hash = hasher.hash(req["password"])

    try:
        await db.create_user(current_app.db_engine, req["username"], password_hash)
    except Exception:
        return jsonify({"success": False, "status": "Failed to create user"}), 400

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
        print(user["password_hash"])
        hasher.verify(user["password_hash"], req["password"])
    except Exception:
        return jsonify({"error": "Invalid password"}), 400

    token = auth.dump_token(user["username"])
    return jsonify({"token": token})

if __name__ == "__main__":
    app.run()
