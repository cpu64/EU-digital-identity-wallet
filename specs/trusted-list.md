# Trusted List

Simple API for retrieving trusted PID provider metadata. **CORS is set to "allow=*"**.

*Note: PID provider registration is done throught the website at `trusted-list.wallet.test`*

## Endpoints

### GET /api/trusted-list

Returns the full list of trusted PID providers. Clients can optionally request a subset of fields using the `fields` query parameter.

**Query Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| fields | string | Comma-separated list of fields to include in the response (e.g., `domain,name`). If omitted, all fields are returned. |

**Example Request**

```http
GET /api/trusted-list?fields=domain,name
```

**Example Response (200 OK)**

```json
[
  {
    "domain": "example.com",
    "name": "Example Provider",
    "public_key": "BASE64_PUBLIC_KEY"
  },
  {
    "domain": "provider.org",
    "name": "Provider Org",
    "public_key": "BASE64_PUBLIC_KEY"
  }
]
```

**Fields**

| Field | Type | Description |
|------|------|-------------|
| domain | string | Provider domain |
| name | string | Human-readable provider name |
| public_key | string | PID provider BASE64 encoded public key  |

## GET /pid-provider/{name}

Returns metadata for the specified PID provider or `404 Not Found` if provider is unknown.

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| name | string | The name of the PID provider (URL-encoded) |

**Example Request**

```
GET /pid-provider/{PID%20Provider}
```

**Example Response (200 OK)**

```json
{
  "domain": "pid.example.com",
  "name": "PID Provider",
  "public_key": "BASE64_PUBLIC_KEY"
}
```

**Fields**

| Field | Type | Description |
|------|------|-------------|
| domain | string | Provider domain |
| name | string | Human-readable provider name |
| public_key | string | PID provider BASE64 encoded public key |
