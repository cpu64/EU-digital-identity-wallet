import secrets
import time
import asyncio
import hashlib
import urllib.parse
from jwcrypto import jwk
from sd_jwt.issuer import SDJWTIssuer
from sd_jwt.common import SDObj

import routes

# Background task to clean up expired PIDs that have not been retreived
# and unsused codes from offers
async def cleanup_expired_entries(db):
    while True:
        await asyncio.sleep(60)
        try:
            async with db.connection() as conn:
                await conn.execute("""
                    DELETE FROM issued_pids
                    WHERE created_at < NOW() - INTERVAL '2 minutes'
                """)
                await conn.execute("""
                    DELETE FROM issuance_codes
                    WHERE created_at < NOW() - INTERVAL '2 minutes'
                """)
        except Exception:
            pass


# Generate PIDs and store them in database together with user's passkey
async def generate_pid(db, app, pan: str, pub_key, passkey: str):
    async with db.connection() as conn:
        record = await conn.fetch_first(
            "SELECT * FROM citizens WHERE personal_administrative_number = :pan",
            {"pan": pan}
        )

    parsed_pub_key = None

    try:
        # Decodes url encoding of JWK key
        decoded_key = urllib.parse.unquote(pub_key)
        parsed_pub_key = jwk.JWK.from_json(decoded_key)
    except Exception as e:
        raise ValueError(f"Invalid JWK format from wallet: {str(e)}")

    # Mandatory (and some optional) attributes according to
    # https://github.com/eu-digital-identity-wallet/eudi-doc-attestation-rulebooks-catalog/blob/main/rulebooks/pid/pid-rulebook.md#2-pid-attributes-and-metadata

    # Attributes wrapped in SDObj are Selective Disclose Objects, and are
    # hashed individually. This allows the wallet user to prove individual
    # facts

    user_claims = {
        SDObj("given_name"): record["given_name"],
        SDObj("family_name"): record["family_name"],
        SDObj("birth_date"): str(record["birth_date"]),
        SDObj("birth_place"): record["birth_place"],
        SDObj("nationality"): record["nationality"],
        SDObj("resident_address"): record["resident_address"],
        SDObj("resident_country"): record["resident_country"],
        SDObj("resident_state"): record["resident_state"],
        SDObj("resident_city"): record["resident_city"],
        SDObj("resident_postal_code"): record["resident_postal_code"],
        SDObj("resident_street"): record["resident_street"],
        SDObj("resident_house_number"): record["resident_house_number"],
        SDObj("sex"): record["sex"],
        SDObj("email_address"): record["email_address"],
        "issuing_authority": "Nacionalinis Gyventojų Registras",
        "issuing_country": "LT",
        "iss": "https://pid-provider.wallet.test",
        "iat": int(time.time()),
        "exp": int(time.time()) + (60*60*24*120),
        "cnf": {"jwk": parsed_pub_key.export_public(as_dict=True)}
    }

    issuer = SDJWTIssuer(
        user_claims=user_claims,
        issuer_key=app.issuer_key,
        holder_key=parsed_pub_key,
        sign_alg="ES256"
    )
    token = issuer.sd_jwt_issuance

    # Save to Issued PID to database
    hashed_passkey = hashlib.sha256(passkey.encode()).hexdigest()
    async with db.connection() as conn:
        await conn.execute(
            "INSERT INTO issued_pids (passkey, sd_jwt) VALUES (:passkey, :sd_jwt)",
            {"passkey": hashed_passkey, "sd_jwt": token}
        )

async def create_url(db, pan) -> str:
    code = secrets.token_urlsafe()[:32]

    async with db.connection() as conn:
        await conn.execute("DELETE FROM issuance_codes WHERE pan = :pan", {"pan": pan})
        await conn.execute(
            "INSERT INTO issuance_codes (code, pan) VALUES (:code, :pan)",
            {"code": code, "pan": pan}
        )

    offer_uri = f"openid-credential-offer://?credential_offer_uri=https://{routes.PUBLIC_DOMAIN}/api/credential-offer/{code}"
    return offer_uri
