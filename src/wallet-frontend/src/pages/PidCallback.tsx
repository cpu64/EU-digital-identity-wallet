import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { addCredential, type Credential } from "@/data/wallet_data";
import styles from "../components/PidProvidersPage/PidProviders.module.css";
import { useTranslation } from "react-i18next";

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }
  return atob(base64);
}

function parseDisclosure(disclosure: string): [string, string, unknown] {
  const decoded = base64UrlDecode(disclosure);
  return JSON.parse(decoded);
}

function parseSdJwt(sdJwt: string): {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  disclosures: Record<string, unknown>;
} {
  const parts = sdJwt.split("~");
  const jwtPart = parts[0];
  const disclosureParts = parts.slice(1).filter((p) => p.length > 0);

  const [headerB64, payloadB64] = jwtPart.split(".");
  const header = JSON.parse(base64UrlDecode(headerB64));
  const payload = JSON.parse(base64UrlDecode(payloadB64));

  const disclosures: Record<string, unknown> = {};
  for (const d of disclosureParts) {
    try {
      const [, name, value] = parseDisclosure(d);
      disclosures[name] = value;
    } catch {}
  }

  return { header, payload, disclosures };
}

const FIELD_LABELS: Record<string, string> = {
  given_name: "Given Name",
  family_name: "Family Name",
  birth_date: "Date of Birth",
  birth_place: "Place of Birth",
  nationality: "Nationality",
  resident_address: "Address",
  resident_country: "Country",
  resident_state: "State",
  resident_city: "City",
  resident_postal_code: "Postal Code",
  resident_street: "Street",
  resident_house_number: "House Number",
  sex: "Gender",
  email_address: "Email Address",
};

function PidCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    async function receivePid() {
      try {
        const passkey = sessionStorage.getItem("pid_passkey");
        const providerDomain = sessionStorage.getItem("pid_provider_domain");
        const receiveEndpoint = sessionStorage.getItem("pid_receive_endpoint");
        const privateKeyRaw = sessionStorage.getItem("pid_private_key");

        if (!passkey || !providerDomain || !receiveEndpoint || !privateKeyRaw) {
          throw new Error(t("pid_callback.missing_data"));
        }

        const response = await fetch(receiveEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ passkey }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(
            data.error || `Failed to receive PID (${response.status})`,
          );
        }

        const data = await response.json();
        if (!data.pid) {
          throw new Error(t("pid_callback.no_pid"));
        }

        const { payload, disclosures } = parseSdJwt(data.pid);

        const subject: Record<string, string> = {};
        for (const [key, value] of Object.entries(disclosures)) {
          const label = FIELD_LABELS[key] || key;
          subject[label] = String(value);
        }

        const credential: Credential = {
          id: `urn:uuid:${crypto.randomUUID()}`,
          type: "PersonalIdentificationData",
          title: "Personal ID (PID)",
          issuer: {
            name: String(payload.issuing_authority || "PID Provider"),
            did: `did:web:${providerDomain}`,
          },
          issuanceDate: payload.iat
            ? new Date(Number(payload.iat) * 1000).toISOString()
            : new Date().toISOString(),
          expirationDate: payload.exp
            ? new Date(Number(payload.exp) * 1000).toISOString()
            : "",
          format: "vc+sd-jwt",
          status: "valid",
          subject,
          raw: {
            sd_jwt: data.pid,
            payload,
            disclosures,
            private_key: JSON.parse(privateKeyRaw),
          },
        };

        await addCredential(credential);

        sessionStorage.removeItem("pid_passkey");
        sessionStorage.removeItem("pid_private_key");
        sessionStorage.removeItem("pid_provider_domain");
        sessionStorage.removeItem("pid_receive_endpoint");

        setStatus("success");
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : "Unknown error occurred",
        );
        setStatus("error");
      }
    }

    receivePid();
  }, []);

  if (status === "loading") {
    return (
      <div className={styles.container}>
        <div className={styles.statusSection}>
          <Loader2 size={48} className={styles.statusIcon} />
          <h2 className={styles.statusTitle}>
            {t("pid_callback.loading_title")}
          </h2>
          <p className={styles.statusText}>{t("pid_callback.loading_text")}</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className={styles.container}>
        <div className={styles.statusSection}>
          <XCircle size={48} className={styles.errorIcon} />
          <h2 className={styles.statusTitle}>
            {t("pid_callback.error_title")}
          </h2>
          <p className={styles.statusText}>{errorMessage}</p>
          <button
            className={styles.backButton}
            onClick={() => navigate("/pid-providers")}
          >
            {t("pid_callback.try_again")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.statusSection}>
        <CheckCircle size={48} className={styles.successIcon} />
        <h2 className={styles.statusTitle}>
          {t("pid_callback.success_title")}
        </h2>
        <p className={styles.statusText}>{t("pid_callback.success_text")}</p>
        <button
          className={styles.backButton}
          onClick={() => navigate("/credentials")}
        >
          {t("pid_callback.view_credentials")}
        </button>
      </div>
    </div>
  );
}

export default PidCallback;
