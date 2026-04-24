import { useNavigate } from "react-router-dom";
import styles from "./Credential.module.css";
import type { Credential } from "@/data/wallet_data";
import { useTranslation } from "react-i18next";

type CredentialProps = {
  credential: Credential;
};

function CredentialTest({ credential }: CredentialProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div
      className={styles.cardOuter}
      onClick={() =>
        navigate(`/credentials/${encodeURIComponent(credential.id)}`)
      }
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          navigate(`/credentials/${encodeURIComponent(credential.id)}`);
        }
      }}
    >
      <div className={styles.cardInner}>
        <div className={styles.cardTitle}>
          <h4>{credential.title}</h4>
        </div>
        <div className={styles.cardContent}>
          <span className={styles.label}>{t("credential_card.issuer")}</span>
          <span className={styles.value}>{credential.issuer.name}</span>
        </div>
      </div>
    </div>
  );
}

export default CredentialTest;
