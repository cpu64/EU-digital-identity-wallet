# Trusted List

Simple API for retrieving trusted PID provider and relying party metadata. **CORS is set to "allow=*"**.

*Note: PID provider and relying party registration is done throught the website at `trusted-list.wallet.test`*

## Endpoints

### GET /api/trusted-list/pid-provider

Returns the full list of trusted PID providers. Clients can optionally request a subset of fields using the `fields` query parameter.

**Query Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| fields | string | Comma-separated list of fields to include in the response. If omitted, all fields are returned. |

**Example Request**

```http
GET /api/trusted-list/pid-provider?fields=domain,name,request_pid_endpoint,receive_pid_endpoint,public_key
```

**Example Response (200 OK)**

```json
[
  {
    "domain": "example.com",
    "name": "Example Provider",
    "request_pid_endpoint": "https://example.com/api/request-pid",
    "receive_pid_endpoint": "https://example.com/api/receive-pid",
    "public_key": {
      "kty": "EC",
      "crv": "P-256",
      "x": "c3QTBbjb7tTkH23lAYpP04N8Op6qTwnGftuETv97EGM",
      "y": "9HhJ9VtmRIJlS6XAWzjP7W0uApQCHbeNJ5lLg6Xs28E",
      "alg": "ES256",
      "use": "sig"
    }
  },
  {
    "domain": "provider.org",
    "name": "Provider Org",
    "request_pid_endpoint": "https://provider.org/api/request-pid",
    "receive_pid_endpoint": "https://provider.org/api/receive-pid",
    "public_key": {
      "kty": "EC",
      "crv": "P-256",
      "x": "U8MzFmbZy58hpghwdJlpgkj4YoDL7sw72lqth7ElCT0",
      "y": "GBwTgqIxl0_T5nl3i_4qGhcezQYb9D2r2gGFvZlEy7o",
      "alg": "ES256",
      "use": "sig"
    }
  }
]
```

**Fields**

| Field | Type | Description |
|------|------|-------------|
| domain | string | Provider domain |
| name | string | Human-readable provider name |
| request_pid_endpoint | string | The endpoint used to request PID (must be `https`) |
| receive_pid_endpoint | string | The endpoint used to receive PID (must be `https` and CORS is set to `"allow=*"`) |
| public_key | object | The public key of the provider, used for verifying digital signatures. This is represented in JWK (JSON Web Key) format and includes the following components: |
| public_key.kty | string | The key type. For this API, it will always be EC (Elliptic Curve). |
| public_key.crv | string | The curve used in the key. For this API, it will always be P-256, an elliptic curve used for ECDSA (Elliptic Curve Digital Signature Algorithm) with SHA-256. |
| public_key.x | string | The X coordinate of the elliptic curve public key, encoded in Base64 URL encoding. |
| public_key.y | string | The Y coordinate of the elliptic curve public key, encoded in Base64 URL encoding. |
| public_key.alg | string | The algorithm associated with the public key. For this API, it will always be ES256 (ECDSA with P-256 and SHA-256). |
| public_key.use | string | The intended use of the public key. For this API, it will always be sig, meaning the key is used for signature verification. |

### GET /api/pid-provider

Returns metadata for the PID provider specified in the query parameter or `404 Not Found` if the provider is unknown. One and only one parameter must be provided.

**Query Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| domain | string | Provider domain (URL-encoded) |
| name | string | The name of the PID provider (URL-encoded) |
| request_pid_endpoint | string | The endpoint used to request PID (must be `https`) |
| receive_pid_endpoint | string | The endpoint used to receive PID (must be `https` and CORS is set to `"allow=*"`) |

**Example Request**

```
GET /api/pid-provider?domain=example.com
```

**Example Response (200 OK)**

```json
{
  "domain": "example.com",
  "name": "Example Provider",
  "request_pid_endpoint": "https://example.com/api/request-pid",
  "receive_pid_endpoint": "https://example.com/api/receive-pid",
  "public_key": {
    "kty": "EC",
    "crv": "P-256",
    "x": "c3QTBbjb7tTkH23lAYpP04N8Op6qTwnGftuETv97EGM",
    "y": "9HhJ9VtmRIJlS6XAWzjP7W0uApQCHbeNJ5lLg6Xs28E",
    "alg": "ES256",
    "use": "sig"
  }
}
```

**Fields**

| Field | Type | Description |
|------|------|-------------|
| domain | string | Provider domain |
| name | string | Human-readable provider name |
| request_pid_endpoint | string | The endpoint used to request PID (must be `https`) |
| receive_pid_endpoint | string | The endpoint used to receive PID (must be `https` and CORS is set to `"allow=*"`) |
| public_key | object | The public key of the provider, used for verifying digital signatures. This is represented in JWK (JSON Web Key) format and includes the following components:
| public_key.kty | string | The key type. For this API, it will always be EC (Elliptic Curve).
| public_key.crv | string | The curve used in the key. For this API, it will always be P-256, an elliptic curve used for ECDSA (Elliptic Curve Digital Signature Algorithm) with SHA-256.
| public_key.x | string | The X coordinate of the elliptic curve public key, encoded in Base64 URL encoding.
| public_key.y | string | The Y coordinate of the elliptic curve public key, encoded in Base64 URL encoding.
| public_key.alg | string | The algorithm associated with the public key. For this API, it will always be ES256 (ECDSA with P-256 and SHA-256).
| public_key.use | string | The intended use of the public key. For this API, it will always be sig, meaning the key is used for signature verification.

### GET /api/trusted-list/relying-party

Returns the full list of trusted relying parties. Clients can optionally request a subset of fields using the `fields` query parameter.

**Query Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| fields | string | Comma-separated list of fields to include in the response. If omitted, all fields are returned. |

**Example Request**

```http
GET /api/trusted-list/relying-party?fields=name,proof_endpoint
```

**Example Response (200 OK)**

```json
[
  {
    "name": "Example Relying Party",
    "proof_endpoint": "https://relying-party.example.com/proof",
  },
  {
    "name": "Hot Sauce",
    "proof_endpoint": "https://hot-sauce.example.com/proof",
  }
]
```

**Fields**

| Field | Type | Description |
|------|------|-------------|
| name | string | Human-readable relying party name |
| proof_endpoint | string | The endpoint relying party will use to accept proof |

### GET /api/relying-party

Returns metadata for the relying party specified in the query parameter or `404 Not Found` if the relying party is unknown. One and only one parameter must be provided.

**Query Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| name | string | The name of the relying party (URL-encoded) |
| proof_endpoint | string | The endpoint relying party uses to accept proof (URL-encoded) |

**Example Request**

```
GET /api/relying-party?name=Example%20Relying%20Party
```

**Example Response (200 OK)**

```json
{
  "name": "Example Relying Party",
  "proof_endpoint": "https://relying-party.example.com/proof",
}
```

**Fields**

| Field | Type | Description |
|-----------|------|-------------|
| name | string | The name of the relying party (URL-encoded) |
| proof_endpoint | string | The endpoint relying party uses to accept proof (URL-encoded) |
