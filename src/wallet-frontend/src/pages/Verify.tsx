import { useState } from "react";
import { mockCredentials, type Credential } from "@/data/mock-credentials";
import styles from "../components/VerifyPage/Verify.module.css";
import { ShieldCheck } from "lucide-react";

type VerificationRequest = {
  credentialType: string;
  requestedAttributes: string[];
  relyingParty?: string;
};

function Verify() {
  const [jsonInput, setJsonInput] = useState(`{
    "credentialType": "EuropeanDigitalIdentity",
    "requestedAttributes": ["Given Name", "Family Name", "Date of Birth"],
    "relyingParty": "Airport Border Control"
}`);
  const [error, setError] = useState("");
  const [request, setRequest] = useState<VerificationRequest | null>(null);
  const [matchedCredential, setMatchedCredential] = useState<Credential | null>(
    null,
  );
  const [checkedAttributes, setCheckedAttributes] = useState<
    Record<string, boolean>
  >({});
  const [shared, setShared] = useState(false);

  const handleVerify = () => {
    setError("");
    setRequest(null);
    setMatchedCredential(null);
    setCheckedAttributes({});
    setShared(false);

    let parsed: VerificationRequest;
    try {
      parsed = JSON.parse(jsonInput);
    } catch {
      setError("Invalid JSON. Please check the format and try again.");
      return;
    }

    if (!parsed.credentialType || !Array.isArray(parsed.requestedAttributes)) {
      setError(
        'JSON must contain "credentialType" (string) and "requestedAttributes" (array of strings).',
      );
      return;
    }

    const credential = mockCredentials.find(
      (c) => c.type === parsed.credentialType,
    );
    if (!credential) {
      setError(
        `No credential of type "${parsed.credentialType}" found in your wallet.`,
      );
      return;
    }

    const initialChecked: Record<string, boolean> = {};
    for (const attr of Object.keys(credential.subject)) {
      initialChecked[attr] = parsed.requestedAttributes.includes(attr);
    }

    setRequest(parsed);
    setMatchedCredential(credential);
    setCheckedAttributes(initialChecked);
  };

  const toggleAttribute = (attr: string) => {
    setCheckedAttributes((prev) => ({ ...prev, [attr]: !prev[attr] }));
  };

  const handleShare = () => {
    setShared(true);
  };

  const handleReset = () => {
    setJsonInput("");
    setError("");
    setRequest(null);
    setMatchedCredential(null);
    setCheckedAttributes({});
    setShared(false);
  };

  const selectedCount = Object.values(checkedAttributes).filter(Boolean).length;

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>
        <ShieldCheck size={28} /> Verify
      </h1>

      {!request && (
        <div className={styles.inputSection}>
          <label className={styles.label} htmlFor="json-input">
            Paste a verification request (JSON)
          </label>
          <textarea
            id="json-input"
            className={styles.textarea}
            rows={10}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder={`{
                "credentialType": "EuropeanDigitalIdentity",
                "requestedAttributes": ["Given Name", "Family Name", "Date of Birth"],
                "relyingParty": "Airport Border Control"
                }`}
            spellCheck={false}
          />
          {error && <p className={styles.error}>{error}</p>}
          <button
            className={styles.verifyButton}
            onClick={handleVerify}
            disabled={!jsonInput.trim()}
          >
            Verify
          </button>
        </div>
      )}

      {request && matchedCredential && !shared && (
        <div className={styles.reviewSection}>
          {request.relyingParty && (
            <p className={styles.rpInfo}>
              <strong>{request.relyingParty}</strong> is requesting attributes
              from your <strong>{matchedCredential.title}</strong>
            </p>
          )}
          {!request.relyingParty && (
            <p className={styles.rpInfo}>
              A relying party is requesting attributes from your{" "}
              <strong>{matchedCredential.title}</strong>
            </p>
          )}

          <div className={styles.credentialInfo}>
            <span className={styles.credType}>{matchedCredential.title}</span>
            <span className={styles.issuer}>
              Issued by {matchedCredential.issuer.name}
            </span>
          </div>

          <div className={styles.attributeList}>
            <div className={styles.attributeHeader}>
              <span>Attribute</span>
              <span>Value</span>
              <span>Share</span>
            </div>
            {Object.entries(matchedCredential.subject).map(([attr, value]) => {
              const isRequested = request.requestedAttributes.includes(attr);
              return (
                <label
                  key={attr}
                  className={`${styles.attributeRow} ${isRequested ? styles.requested : ""}`}
                >
                  <span className={styles.attrName}>
                    {attr}
                    {isRequested && (
                      <span className={styles.requiredBadge}>requested</span>
                    )}
                  </span>
                  <span className={styles.attrValue}>{value}</span>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={checkedAttributes[attr] ?? false}
                    onChange={() => toggleAttribute(attr)}
                  />
                </label>
              );
            })}
          </div>

          <div className={styles.actions}>
            <button className={styles.cancelButton} onClick={handleReset}>
              Decline
            </button>
            <button
              className={styles.shareButton}
              onClick={handleShare}
              disabled={selectedCount === 0}
            >
              Share {selectedCount} attribute{selectedCount !== 1 ? "s" : ""}
            </button>
          </div>
        </div>
      )}

      {shared && (
        <div className={styles.successSection}>
          <div className={styles.successIcon}>
            <ShieldCheck size={48} />
          </div>
          <h2 className={styles.successTitle}>Attributes Shared</h2>
          <p className={styles.successText}>
            The following attributes were shared
            {request?.relyingParty ? ` with ${request.relyingParty}` : ""}:
          </p>
          <ul className={styles.sharedList}>
            {Object.entries(checkedAttributes)
              .filter(([, checked]) => checked)
              .map(([attr]) => (
                <li key={attr} className={styles.sharedItem}>
                  <span className={styles.sharedLabel}>{attr}</span>
                  <span className={styles.sharedValue}>
                    {matchedCredential?.subject[attr]}
                  </span>
                </li>
              ))}
          </ul>
          <button className={styles.resetButton} onClick={handleReset}>
            New Verification
          </button>
        </div>
      )}
    </div>
  );
}

export default Verify;
