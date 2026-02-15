club - The relying party
lotp - List of trusted providers
pidp - PID provider
server-1984 - Backend
wallet-1984 - Frontend
dns - Nginx based DNS for our infrastucture (Only used for demos)


Add this to your "/etc/hosts" (or "C:\Windows\System32\drivers\etc\hosts" on windows):
    127.0.0.1 club.test
    127.0.0.1 lotp.test
    127.0.0.1 pidp.test
    127.0.0.1 server-1984.test
    127.0.0.1 wallet-1984.test

Build:
    docker compose build
Run:
    docker compose up
