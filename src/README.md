## Naming
* relying-party - The relying party
* trusted-list - List of trusted PID providers
* pid-provider - PID provider
* wallet-backend - Backend
* wallet-frontend - Frontend
* reverse-proxy - Nginx based proxy for our infrastructure (only used for demos)

## Dependencies
Add this to your `/etc/hosts` (or `C:\Windows\System32\drivers\etc\hosts` on windows):
```
127.0.0.1 relying-party.wallet.test
127.0.0.1 trusted-list.wallet.test
127.0.0.1 pid-provider.wallet.test
127.0.0.1 wallet-backend.wallet.test
127.0.0.1 wallet-frontend.wallet.test
```

Install the root CA certificate `certs/root-ca.crt` on your system:
* Arch:
    ```
    sudo cp root-ca.crt /etc/ca-certificates/trust-source/anchors/
    sudo trust extract-compat
    ```

* Debian:
    ```
    sudo cp root-ca.crt /etc/ca-certificates/trust-source/anchors/
    sudo update-ca-certificates
    ```

* Windows:
    ```
    Get a better OS.
    ```

## Without building:
```
docker compose pull
```
## Build:
```
docker compose build
```
## Run (dev with mounted source code):
```
docker compose up
```
## Run (prod with code in docker images):
```
docker compose -f docker-compose.yml up
```
