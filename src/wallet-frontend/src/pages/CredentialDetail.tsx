import { useParams, useNavigate } from "react-router-dom";
import { getCredentialById } from "@/data/mock-credentials";
import { ArrowLeft } from "lucide-react";
import styles from "../components/CredentialsPage/CredentialDetail.module.css";

function CredentialDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const credential = id ? getCredentialById(decodeURIComponent(id)) : undefined;

  if (!credential) {
    return (
      <div className={styles.container}>
        <button
          className={styles.backButton}
          onClick={() => navigate("/credentials")}
        >
          <ArrowLeft size={18} /> Back to credentials
        </button>
        <p>Credential not found.</p>
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
        <ArrowLeft size={18} /> Back to credentials
      </button>

      <div className={styles.header}>
        <h1 className={styles.title}>{credential.title}</h1>
        <span className={`${styles.statusBadge} ${statusClass}`}>
          {credential.status}
        </span>
      </div>

      {/* Subject details */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Subject</h2>
        {Object.entries(credential.subject).map(([label, value]) => (
          <div className={styles.field} key={label}>
            <span className={styles.fieldLabel}>{label}</span>
            <span className={styles.fieldValue}>{value}</span>
          </div>
        ))}
      </div>

      {/* Metadata */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Metadata</h2>
        <div className={styles.metaGrid}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Issuer</span>
            <span className={styles.metaValue}>{credential.issuer.name}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Issuer DID</span>
            <span className={styles.metaValue}>{credential.issuer.did}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Issued</span>
            <span className={styles.metaValue}>
              {formatDate(credential.issuanceDate)}
            </span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Expires</span>
            <span className={styles.metaValue}>
              {formatDate(credential.expirationDate)}
            </span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Format</span>
            <span className={styles.metaValue}>{credential.format}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Type</span>
            <span className={styles.metaValue}>{credential.type}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CredentialDetail;
