# Browser-Based Digital Signing Infrastructure

## Trusted List

The system relies on a trusted registry:

* The **Trusted List API** contains:
* Public keys of certificate authorities

**CA public keys** are retrieved from:

```
GET https://trusted-list.wallet.test/api/certificate-authority?name=Example%20CA
```

These keys are used to:

* verify CA-issued JWTs
* validate document signatures


## System Components

### 1. Client (Browser)

* Generates key pair
* Initiates certificate request
* Performs document signing

### 2. Certificate Authority (CA)

* Authenticates user
* Issues certificates
* Signs responses with CA private key

### 3. Application Backend

* Stores issued certificates

### 4. Trusted List Service

* Provides CA public keys
* Defines trusted CAs

## End-to-End Flow

### A. Certificate Issuance Flow

```
[Browser]
  |
  | 1. Generate key pair
  |    - privateKey (stays local)
  |    - publicKey
  |
  | 2. Create Request JWT
  |    - publicKey
  |    - name, email
  |    - callback URL
  |
  | 3. Redirect user
  v
[CA /authorize?request=JWT]
  |
  | 4. CA authenticates user
  |    - login
  |    - validates JWT
  |
  | 5. CA issues certificate
  |    - binds identity to publicKey
  |
  | 6. CA creates Response JWT
  |    - certificate
  |    - metadata
  |
  | 7. CA signs JWT using CA private key
  |
  | 8. Redirect back
  v
[Browser /callback?response=JWT]
  |
  | 9. Browser verifies JWT
  |    - fetch CA public key from Trusted List
  |    - validate signature
  |
  | 10. Extract certificate
  |
  | 11. Save
  v
[Backend]
  |
  | Store certificate
```

## Trusted List Verification Step

Before accepting any CA response:

1. Browser fetches trusted CA keys:

```
GET https://trusted-list.wallet.test/api/certificate-authority?name=Example%20CA
```

2. Extract matching CA public key
3. Verify CA-signed JWT using that key
4. Accept certificate only if verification succeeds

## Document Signing Flow (https://github.com/Communication-Systems-Group/pdfsign.js)

```
[Browser]
  |
  | 1. Load document (PDF)
  |
  | 2. Compute hash
  |
  | 3. Sign hash using private key
  |
  | 4. Attach:
  |    - signature
  |    - certificate
  |
  | 5. Embed into PDF
  v
[Signed Document]
```
