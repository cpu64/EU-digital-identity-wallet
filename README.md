## Naming
* club - The relying party
* lotp - List of trusted PID providers
* pidp - PID provider
* server-1984 - Backend
* wallet-1984 - Frontend
* dns - Nginx based proxy for our infrastructure (only used for demos)

## Dependencies
Add this to your `/etc/hosts` (or `C:\Windows\System32\drivers\etc\hosts` on windows):
```
127.0.0.1 club.test
127.0.0.1 lotp.test
127.0.0.1 pidp.test
127.0.0.1 server-1984.test
127.0.0.1 wallet-1984.test
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
## Run:
```
docker compose up
```
