import { useEffect, useState } from "react";
import { Building2, ChevronRight } from "lucide-react";
import styles from "../components/PidProvidersPage/PidProviders.module.css";
import { useTranslation } from "react-i18next";
import {
  createPidIssuanceMaterial,
  storePidIssuanceContext,
} from "@/lib/pidIssuance";

type PidProvider = {
  domain: string;
  name: string;
  request_pid_endpoint: string;
  receive_pid_endpoint: string;
};

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
      const { passkey, privateJwk, minimalPubKey } =
        await createPidIssuanceMaterial();

      storePidIssuanceContext({
        passkey,
        privateJwk,
        providerDomain: provider.domain,
        receiveEndpoint: provider.receive_pid_endpoint,
      });

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
