import { useParams, useNavigate } from "react-router-dom";
import {
  getCredentialById,
  deleteCredential,
  type Credential,
} from "@/data/wallet_data";
import { ArrowLeft, Trash2 } from "lucide-react";
import styles from "../components/CredentialsPage/CredentialDetail.module.css";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

function CredentialDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [credential, setCredential] = useState<Credential | undefined>(
    undefined,
  );
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [error, setError] = useState<any>(null);

  const handleDelete = async () => {
    if (!credential) return;
    if (!window.confirm(t("credential_detail.delete_confirm"))) return;
    try {
      await deleteCredential(credential.id);
      navigate("/credentials");
    } catch (err: any) {
      setError(err);
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const cred = id
          ? await getCredentialById(decodeURIComponent(id))
          : undefined;

        setCredential(cred);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  if (loading) return <p>{t("common.loading")}</p>;
  if (error)
    return <p>{t("common.error_message", { message: error.message })}</p>;

  if (!credential) {
    return (
      <div className={styles.container}>
        <button
          className={styles.backButton}
          onClick={() => navigate("/credentials")}
        >
          <ArrowLeft size={18} /> {t("credential_detail.back")}
        </button>
        <p>{t("credential_detail.not_found")}</p>
      </div>
    );
  }

  const statusClass =
    credential.status === "valid"
      ? styles.statusValid
      : credential.status === "expired"
        ? styles.statusExpired
        : styles.statusRevoked;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <div className={styles.container}>
      <button
        className={styles.backButton}
        onClick={() => navigate("/credentials")}
      >
        <ArrowLeft size={18} /> {t("credential_detail.back")}
      </button>

      <div className={styles.header}>
        <h1 className={styles.title}>{credential.title}</h1>
        <div className={styles.headerActions}>
          <span className={`${styles.statusBadge} ${statusClass}`}>
            {credential.status}
          </span>
          <button className={styles.deleteButton} onClick={handleDelete}>
            <Trash2 size={18} /> {t("credential_detail.delete")}
          </button>
        </div>
      </div>

      {/* Subject details */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          {t("credential_detail.subject")}
        </h2>
        {Object.entries(credential.subject).map(([label, value]) => (
          <div className={styles.field} key={label}>
            <span className={styles.fieldLabel}>{label}</span>
            <span className={styles.fieldValue}>{value}</span>
          </div>
        ))}
      </div>

      {/* Metadata */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          {t("credential_detail.metadata")}
        </h2>
        <div className={styles.metaGrid}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>
              {t("credential_detail.issuer")}
            </span>
            <span className={styles.metaValue}>{credential.issuer.name}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>
              {t("credential_detail.issuer_did")}
            </span>
            <span className={styles.metaValue}>{credential.issuer.did}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>
              {t("credential_detail.issued")}
            </span>
            <span className={styles.metaValue}>
              {formatDate(credential.issuanceDate)}
            </span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>
              {t("credential_detail.expires")}
            </span>
            <span className={styles.metaValue}>
              {formatDate(credential.expirationDate)}
            </span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>
              {t("credential_detail.format")}
            </span>
            <span className={styles.metaValue}>{credential.format}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>
              {t("credential_detail.type")}
            </span>
            <span className={styles.metaValue}>{credential.type}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CredentialDetail;
