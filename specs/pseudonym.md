# Relying Party – Wallet Login Link

The basic idea is that the relying party creates a login link that the user stores in their wallet.

The wallet does not store sensitive account data. Instead, it stores a login URL provided by the relying party and presents it back to the user as a launch button.

## Registration Flow

### 1. Relying Party creates login link

The relying party generates a cryptographically random 256-bit token and associates it with a user account internally.

The relying party then creates a login URL:

```text
https://relying-party.com/api/login?token=base64url(random(256-bit))
```

**Example**

```text
https://relying-party.com/api/login?token=Q1h4T0J6Qm9sV0l3bUN1cXNzY3d6N2xWb2d4d1B6Qk5vM2Q
```

The token acts as a reference to the user account stored by the relying party.

### 2. User copies login link to wallet

The user copies the login URL and pastes it into the wallet.

The wallet stores:

* Full login URL
* Extracted domain name
* Optional metadata (timestamps, labels, etc.)

### 3. Wallet creates account button

The wallet extracts the domain from the URL and creates a button for the user.

**Example**

```text
relying-party.com
```

The button represents the relying party account entry stored in the wallet.

---

# Authentication Flow

### 1. User selects account

The user selects the stored account button inside the wallet.

### 2. Wallet redirects user

The wallet redirects the user to the stored login URL.

**Example Redirect**

```text
https://relying-party.com/api/login?token=Q1h4T0J6Qm9sV0l3bUN1cXNzY3d6N2xWb2d4d1B6Qk5vM2Q
```

### 3. Relying Party authenticates token

The relying party:

* Extracts the token from the request
* Looks up the associated account/session
* Authenticates the user
* Creates an authenticated session
