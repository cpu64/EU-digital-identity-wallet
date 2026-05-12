# Certificate authority

# Workflow

1. On account creation, wallet generates a key pair for document signing.
1. On login, if the user does not yet have a certificate, they are prompted to
   pick a certificate authority from the trusted list.
1. The user logs in to the certificate authority's website.
1. The retrieves an CA API URL for signing a certificate and pastes it into the wallet.
1. Wallet makes the necessary calls to the CA service to retrieve a certificate.
1. Wallet signs a document with the signature (and CA provided certificate).
1. An user who wants to verify the document retrieves the CA's public certificate and uses it for verification.

## Endpoints

### GET /api/get_ca_cert

Parameters: None

Returns (200 OK / 500 Internal Server Error) the certificate authority's X.509 certificate in text form (see `src/certs/root-ca.crt` for an example).

### POST /api/sign/{guid}

Parameters (a certificate signing request):

```json
{
   "csr": string
}
```

Response (200 OK; a certificate):

```json
{
   "crt": string
}
```

Otherwise, may return 500 Internal Server Error depending on the circumstance.
