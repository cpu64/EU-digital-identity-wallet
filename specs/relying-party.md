# Relying party - Wallet
## General Flow
### 1. Relying party requests proof
The relying party sends a request to the wallet specifying which claims must be proven. 

**System specifics:**
- Request is passed via **QR code** or copy/paste.
- Includes a **256-bit random nonce** that acts as a session key.
- Contains the **endpoint URL** where the wallet will send the proof.

**Example request:**

```json
{
    "requested_claims": [ "birthdate" ],
    "nonce": "3f1e4c2d5a6b7890123456789abcdef0123456789abcdef0123456789abcdef",
    "proof_endpoint": "https://relying-party.example.com/proof",
    "exp": 1715000000
}
```

### 2. Wallet receives proof request
User scans the QR code or copy/pastes the request, then wallet checks if it possess an SD-JWT containing the requested claims and that the request has not expired. Additionally, checks if the relying party is in the Trusted List and gives a warning if not.

### 3. Wallet selects claims
From the SD-JWT disclosures, the wallet selects the claims required to satisfy the relying party’s request.

### 4. Wallet constructs proof presentation
**Construction logic:**

```
salt + claim_name + claim_value → disclosure
hash(disclosure) -> must match entry in _sd inside the SD-JWT
```

**Example data:**

```
salt: "randomSalt123"
claim_name: "birthdate"
claim_value: "1990-05-01"
```
**Example disclosure:**
```
[
    "randomSalt123",
    "birthdate",
    "1990-05-01"
]
```

### 5. Wallet returns proof

The wallet sends the presentation back to the relying party at the specified endpoint.

**Components:**
```
SD-JWT
Disclosure
KeyBindingJWT
```

**Example:**

**SD-JWT**:
```json
{
    "header": {"alg": "ES256","kid": "issuer-key"},
    "payload": {
        "issuing_authority": "Nacionalinis Gyventojų Registras",
        "iss": "https://issuer.example.com",
        "iat": 1710000000,
        "exp": 1720000000,
        "_sd_alg": "sha-256",
        "_sd": ["hash_birthdate", "hash_name"],
        "cnf": {
            "jwk": {
                "kty": "EC",
                "kid": "holder-key",
                "crv": "P-256",
                "x": "CPrcvXQhCRDCbjH0BfKnhKfm0s2gBJENrnhO5XjFzdA",
                "y": "xviNSBRDdmkBHykW8dRxGbDvrIkFhlt7InVscHuxAIg"
            }
        }
    }
}
```

**Disclosure**:
```json
["randomSalt123","birthdate","1990-05-01"]
```
**KeyBindingJWT**:
```json
{
    "header": {"alg": "ES256"},
    "payload": {
    "aud": "https://verifier.example.com",
    "iat": 1712000000,
    "exp": 1712003600,
    "nonce": "3f1e4c2d5a6b7890123456789abcdef0123456789abcdef0123456789abcdef",
    "sd_hash": "hash_of_sd_jwt_and_disclosures"
    }
}
```

**Part explanations:**

- **SD-JWT:** original issuer-signed credential; `_sd` contains hashes of all possible claims; `iat` and `exp` enforce credential validity.
- **Disclosure:** only the requested claims revealed.
- **KeyBindingJWT:** wallet-signed proof using the 256-bit nonce/session key; `iat` and `exp` enforce proof/session validity; ensures the presentation is bound to this session and relying party.

**Transport encoding:**

```
base64url(SD-JWT) ~ base64url(Disclosure) ~ base64url(KeyBindingJWT)
```

### 6. Relying party verifies issuer signature
Validate SD-JWT signature and check that `iat`/`exp` indicate the credential is currently valid.

### 7. Relying party validates disclosed claims

Steps:

1. Extract disclosures `[salt, claim_name, claim_value]`.
2. Hash each disclosure using `_sd_alg`.
3. Check hash exists in SD-JWT `_sd`.

### 8. Relying party verifies wallet binding

Steps:

1. Extract KeyBindingJWT.
2. Use the wallet’s public key to validate the signature on the KeyBindingJWT.
3. Check `nonce` matches the 256-bit session key from the proof request.
4. Verify `aud` matches relying party ID.
5. Verify `sd_hash` matches hash of SD-JWT + disclosed disclosures.
6. Verify `iat`/`exp` to ensure proof/session is still valid.
7. Accept/reject based on all checks.

### 9. Relying party accepts or rejects proof
If all validations pass, the proof is accepted and disclosed claims are used.

## API

Simple API for receiving proof. **CORS is set to "allow=*"**.

*Note: The main website is at `relying-party.wallet.test`. The `public.relying-party.wallet.test` domain is for receiving proof only and is set to CORS "allow=\*"*

## Endpoints

### POST /api/proof

Accepts a wallets’s proof presentation and validates it.

**Example Request**

```http
{
  "proof": "base64url(SD-JWT)~base64url(Disclosure)~base64url(KeyBindingJWT)"
}
```

**Fields**

| Field | Type | Description |
|-------|------|-------------|
| base64url(SD-JWT) | string | The issuer-signed credential containing the `_sd` array of claim hashes. Used to verify the claims are authentic and issued by a trusted party. |
| base64url(Disclosure) | string | The claims the holder chooses to reveal. Each disclosure is hashed and compared against the SD-JWT `_sd` array to confirm integrity. |
| base64url(KeyBindingJWT) | string | Holder-signed JWT proving control of the SD-JWT and disclosed claims. Includes `nonce`, `aud`, and `sd_hash` to bind the proof to the session and verifier. |
