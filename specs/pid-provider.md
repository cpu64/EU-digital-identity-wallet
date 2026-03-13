# PID provider - Wallet

## Workflow

### Wallet user requests a PID.
Wallets user selects a PID provider from which to obtain their PID.

### Wallet generates per-PID keys
The wallet generates:
- Per-PID Key Pair: A public/private key pair used for proof-of-possession.
- Retrieval Passkey: A  4096-character secret to make a secure, handshake to retreive the token

### Wallet redirects to PID provider
The wallet creates a URL to redirect the user to the PID provider with the public key, passkey and a redirect URI back to the wallet.

### PID provider authenticates the user
The user has to login to the PID provider to authenticate their identity and receive their PID.

### PID provider signs the PID
PID provider formats user's PID into a SD-JWT format, signs it with it's own private key and binds the PID with user's public key.

### PID provider stores signed PID
After signing the PID, PID provider stores it together with user's passkey and waits for the wallet to request the token with the passkey as a handshake.

### Wallet requests the PID
Wallet now makes a separate API call to the PID provider with the passkey as proof of identity.

### PID provider issues the PID
PID provider responds to the request with a signed PID in SD-JWT format.

### PID provider deletes the token
PID provider deletes issued token, or after a certain amount of time if the wallets faiils to ask for it in time.

## Endpoints

**Redirection**\
`GET /Generate`\
Generates the token for the user if they are authenticated

| Parameter      | Type   | Description                                            |
| -------------- | ------ | ------------------------------------------------------ |
| `pub_key`      | String | Wallet's generated per-PID key                         |
| `passkey`      | String | Wallet's generated 4096 char passkey for PID retrieval |
| `redirect_uri` | String | Wallet's URL to be redirected to after PID creation    |

Example URL:
```
https://pid-provider.wallet.test/Generate?pub_key=MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE...&passkey=a8f2z9r1...&redirect_uri=https%3A%2F%2Fwallet-frontend.wallet.test
```


**API Call**\
`POST /Issue`\
Used by the wallet to call the PID provider with a passkey
Request body:
```
{
  "passkey": "4096_char_passkey"
}
```

Example Responses:
- If a matching passkey is found (200 OK) 
```
{
  "pid": "eyJhbGciOiAiRVMyNTYiLCAidHlwIjogImV4YW1wbGUrc2Qtand0In0.eyJfc2QiOiBbIjFpZE9KVXlDamRiZTQwc..."
}
```

- If no matching passkey is found (404 Not found)
```
{
  "error": "passkey doesn't match"
}
```