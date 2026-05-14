## Naming

- relying-party - The relying party
- trusted-list - List of trusted PID providers
- pid-provider - PID provider
- wallet-backend - Backend
- wallet-frontend - Frontend
- reverse-proxy - Nginx based proxy for our infrastructure (only used for demos)

## Dependencies

Add this to your `/etc/hosts` (or `C:\Windows\System32\drivers\etc\hosts` on windows):

```
127.0.0.1 relying-party.wallet.test
127.0.0.1 public.relying-party.wallet.test
127.0.0.1 trusted-list.wallet.test
127.0.0.1 public.trusted-list.wallet.test
127.0.0.1 pid-provider.wallet.test
127.0.0.1 public.pid-provider.wallet.test
127.0.0.1 wallet-backend.wallet.test
127.0.0.1 public.wallet-backend.wallet.test
127.0.0.1 wallet-frontend.wallet.test
127.0.0.1 public.wallet-frontend.wallet.test
127.0.0.1 ca.wallet.test
```

Install the root CA certificate `certs/root-ca.crt` on your system:

- Arch:

  ```
  sudo cp root-ca.crt /etc/ca-certificates/trust-source/anchors/
  sudo trust extract-compat
  ```

- Debian:

  ```
  sudo cp root-ca.crt /etc/ca-certificates/trust-source/anchors/
  sudo update-ca-certificates
  ```

- Windows:
  Certificates can be imported to the browser, e.g., for [Firefox](https://support.mozilla.org/en-US/kb/setting-certificate-authorities-firefox) and [Chrome](https://support.google.com/chrome/a/answer/3505249?hl=en).

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
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```

## Run (prod with code in docker images):

```
docker compose up
```

## Cloud Run Deployment

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) and create a new project (note your **Project ID**).
2. Enable the **Cloud Run API** and **Artifact Registry API**.
3. In **Artifact Registry**, create a repository:
   - Name: `wallet-repo`
   - Format: **Docker**
   - Region: `us-east1` (free tier eligible)
4. Authenticate and build/push your images using the provided script:

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
./build_and_push.sh --project eudiw-ktu --region us-east1 --repo wallet-repo
```

5. Update `cloud-run-service.yaml` with your new image tags (`us-east1-docker.pkg.dev/YOUR_PROJECT_ID/wallet-repo/*:latest`).
6. Deploy the service:

```bash
gcloud run services replace cloud-run-service.yaml --region us-east1
```

### Public Service Links

After successful deployment, the services are routed via the reverse proxy at the following URLs:

- **Frontend**: [https://wallet-stack-334462690212.us-east1.run.app/](https://wallet-stack-334462690212.us-east1.run.app/)
- **Backend**: [https://wallet-stack-334462690212.us-east1.run.app/proxy/backend/](https://wallet-stack-334462690212.us-east1.run.app/proxy/backend/)
- **Relying Party**: [https://wallet-stack-334462690212.us-east1.run.app/proxy/relying-party/](https://wallet-stack-334462690212.us-east1.run.app/proxy/relying-party/)
- **PID Provider**: [https://wallet-stack-334462690212.us-east1.run.app/proxy/pid-provider/](https://wallet-stack-334462690212.us-east1.run.app/proxy/pid-provider/)
- **Public PID Provider**: [https://wallet-stack-334462690212.us-east1.run.app/proxy/public-pid-provider/](https://wallet-stack-334462690212.us-east1.run.app/proxy/public-pid-provider/)
- **Trusted List**: [https://wallet-stack-334462690212.us-east1.run.app/proxy/trusted-list/](https://wallet-stack-334462690212.us-east1.run.app/proxy/trusted-list/)
- **Certificate Authority**: [https://wallet-stack-334462690212.us-east1.run.app/proxy/ca/](https://wallet-stack-334462690212.us-east1.run.app/proxy/ca/)
