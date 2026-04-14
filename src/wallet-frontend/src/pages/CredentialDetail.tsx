import { useParams, useNavigate } from "react-router-dom";
import {
  getCredentialById,
  deleteCredential,
  type Credential,
} from "@/data/wallet_data";
import { ArrowLeft, Trash2 } from "lucide-react";
import styles from "../components/CredentialsPage/CredentialDetail.module.css";
import { useEffect, useState } from "react";

function CredentialDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [credential, setCredential] = useState<Credential | undefined>(
    undefined,
  );
  const [loading, setLoading] = useState(true);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [error, setError] = useState<any>(null);

  const handleDelete = async () => {
    if (!credential) return;
    if (!window.confirm("Are you sure you want to delete this credential?"))
      return;
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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

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
        <div className={styles.headerActions}>
          <span className={`${styles.statusBadge} ${statusClass}`}>
            {credential.status}
          </span>
          <button className={styles.deleteButton} onClick={handleDelete}>
            <Trash2 size={18} /> Delete
          </button>
        </div>
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
