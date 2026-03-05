# Wallet service

All wallet backend endpoints are prefixed with `/api`.

The core workflow for interaction with the backend is:

1. User registers an account with the `/api/register` endpoint.
1. User logs in by passing the credentials to `/api/login` and receiving a bearer token.
   - Note that any further requests must pass in the token via a request header (`Authorization: Bearer {token}`).
1. User stores a string with `/api/store_blob`.
1. User retrieves the last stored string `/api/get_blob`.

## Endpoints

### POST /api/register

Creates a new account for a user. Username must be an alphanumeric string.

Parameters:

```
{
    "username": string,
    "password": string
}
```

Returns a success/failure response with a status message for possible errors (e.g., if a user with the same username already exists).

Response (200 OK / 400 Bad Request / 500 Internal Server Error):

```
{
    "success": boolean,
    "status": string,
}
```

### POST /api/login

Returns a token for a user to authenticate their requests with.

Parameters:

```
{
    "username": string,
    "password": string
}
```

Responses

- On successful login (200 OK):

```
{
    "token": string
}
```

- On login failure (400 Bad Request):

```
{
    "error": string
}
```

### POST /api/store_blob

Allows an authorized user to persistently store a string.
Intended usage is to store encrypted JSON blobs that represent the user's wallet's state, such as credentials and transaction history.

Parameters (bearer token must be supplied in headers):

```
{
    "blob": string
}
```

Returns a success/failure response with a status message for possible errors.

Response (200 OK and 500 Internal Server Error):

```
{
    "success": boolean,
    "status": string,
}
```

Service may also respond with `401 Unauthorized` if the bearer token was invalid or unspecified.

### GET /api/get_blob

Allows an authorized user to retrieve a persistently stored string.
Intended usage (same as with `/api/store_blob`) is to store encrypted JSON blobs that represent the user's wallet's state, such as credentials and transaction history.

No parameters required, only bearer token must be supplied in headers.

Returns the blob last stored by the user, or an empty string if no blob was stored.

Response (200 OK):

```
{
    "blob": string
}
```

Service may also respond with `401 Unauthorized` if the bearer token was invalid or unspecified.
