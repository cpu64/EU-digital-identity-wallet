import os
import secrets
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
    render_template,
    request,
    session,
    url_for,
)
from app import db

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
    app.blob_dir = "blob"
    os.makedirs(app.blob_dir, exist_ok=True)


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


if __name__ == "__main__":
    app.run()
