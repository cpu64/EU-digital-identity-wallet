import { useEffect, useState } from "react";
import { Building2, ChevronRight } from "lucide-react";
import styles from "../components/PidProvidersPage/PidProviders.module.css";
import { useTranslation } from "react-i18next";

type PidProvider = {
  domain: string;
  name: string;
  request_pid_endpoint: string;
  receive_pid_endpoint: string;
};

function generatePasskey(length: number): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => chars[b % chars.length]).join("");
}

async function generateKeyPair(): Promise<{
  publicJwk: JsonWebKey;
  privateJwk: JsonWebKey;
}> {
  const keyPair = await crypto.subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign", "verify"],
  );
  const publicJwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
  const privateJwk = await crypto.subtle.exportKey("jwk", keyPair.privateKey);
  return { publicJwk, privateJwk };
}

function PidProviders() {
  const [providers, setProviders] = useState<PidProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    async function fetchProviders() {
      try {
        const response = await fetch(
          "https://public.trusted-list.wallet.test/api/trusted-list/pid-provider?fields=domain,name,request_pid_endpoint,receive_pid_endpoint",
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch providers: ${response.status}`);
        }
        const data: PidProvider[] = await response.json();
        setProviders(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : t("pid_providers.load_error"),
        );
      } finally {
        setLoading(false);
      }
    }
    fetchProviders();
  }, []);

  async function handleSelectProvider(provider: PidProvider) {
    try {
      const passkey = generatePasskey(64);
      const { publicJwk, privateJwk } = await generateKeyPair();

      // Store passkey, private key, and provider domain for the callback
      sessionStorage.setItem("pid_passkey", passkey);
      sessionStorage.setItem("pid_private_key", JSON.stringify(privateJwk));
      sessionStorage.setItem("pid_provider_domain", provider.domain);
      sessionStorage.setItem(
        "pid_receive_endpoint",
        provider.receive_pid_endpoint,
      );

      // Only send the essential EC key fields
      const minimalPubKey = {
        crv: publicJwk.crv,
        kty: publicJwk.kty,
        x: publicJwk.x,
        y: publicJwk.y,
      };
      const pubKeyParam = encodeURIComponent(JSON.stringify(minimalPubKey));
      const passkeyParam = encodeURIComponent(passkey);
      const redirectUri = encodeURIComponent(
        `${window.location.origin}/pid-callback`,
      );

      const url =
        `${provider.request_pid_endpoint}` +
        `?pub_key=${pubKeyParam}` +
        `&passkey=${passkeyParam}` +
        `&redirect_uri=${redirectUri}`;

      window.location.href = url;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("pid_providers.start_error"),
      );
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>
        <Building2 size={28} /> {t("pid_providers.title")}
      </h1>
      <p className={styles.description}>{t("pid_providers.description")}</p>

      {loading && (
        <p className={styles.loading}>{t("pid_providers.loading")}</p>
      )}
      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && providers.length === 0 && (
        <p className={styles.empty}>{t("pid_providers.empty")}</p>
      )}

      <div className={styles.providerList}>
        {providers.map((provider) => (
          <div
            key={provider.domain}
            className={styles.providerCard}
            onClick={() => handleSelectProvider(provider)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleSelectProvider(provider);
              }
            }}
          >
            <div className={styles.providerInfo}>
              <span className={styles.providerName}>{provider.name}</span>
              <span className={styles.providerDomain}>{provider.domain}</span>
            </div>
            <ChevronRight size={20} className={styles.providerArrow} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default PidProviders;
