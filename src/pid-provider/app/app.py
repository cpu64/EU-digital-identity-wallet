import os

import json
from quart import Quart
from quart_db import QuartDB
from jwcrypto import jwk

from routes import register_routes
from utils import cleanup_expired_entries

PGUSER = os.getenv('PGUSER')
PGPASSWORD = os.getenv('PGPASSWORD')
PGHOST = os.getenv('PGHOST')
PGPORT = os.getenv('PGPORT')
PGDATABASE = os.getenv('PGDATABASE')
DB_URL = f"postgresql://{PGUSER}:{PGPASSWORD}@{PGHOST}:{PGPORT}/{PGDATABASE}"

MAIN_DOMAIN = 'pid-provider.wallet.test'

app = Quart(__name__, host_matching=True, static_host=MAIN_DOMAIN)
app.secret_key = os.environ.get("SECRET_KEY")
db = QuartDB(app, url=DB_URL)

register_routes(app, db)


@app.before_serving
async def startup():
    with open('keys/private_key.pem', 'r') as f:
        app.issuer_key = jwk.JWK.from_pem(f.read().encode())

    # Public key, if needed for trusted list
    with open('keys/public_key.pem', 'rb') as f:
        print("PID provider's public key: ", flush=True)
        print(json.dumps(jwk.JWK.from_pem(f.read())
                                .export_public(as_dict=True)), flush=True)

    app.add_background_task(cleanup_expired_entries, db)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
