## Wallet app

Backend uses `uv` as a package manager, to install:

- On Windows:

```
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

- On Linux:

```
curl -LsSf https://astral.sh/uv/install.sh | sh
```

After installing, relaunch your terminal/IDE.

To launch, run:

```
docker compose up --build
```

Note that when debugging with VSCode (Debug -> Debug wallet), debugpy may
detach on hot reload (fix needed?), React works with hot reload.
