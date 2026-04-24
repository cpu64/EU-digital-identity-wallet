import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getData, addTransaction, type Credential } from "@/data/wallet_data";
import styles from "../components/VerifyPage/Verify.module.css";
import { ShieldCheck, Loader2, Info, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

type VerificationRequest = {
  requested_claims: string[];
  nonce: string;
  proof_endpoint: string;
  exp: number;
};

type Step =
  | "input"
  | "select-credential"
  | "review"
  | "submitting"
  | "success"
  | "error";

const CLAIM_LABELS: Record<string, string> = {
  given_name: "Given Name",
  family_name: "Family Name",
  birth_date: "Date of Birth",
  birthdate: "Date of Birth",
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

function base64UrlEncode(data: Uint8Array): string {
  let binary = "";
  for (const byte of data) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlEncodeString(str: string): string {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function getDisclosureMap(
  sdJwt: string,
): Map<string, { raw: string; salt: string; value: unknown }> {
  const parts = sdJwt.split("~");
  const disclosureParts = parts.slice(1).filter((p) => p.length > 0);
  const map = new Map<string, { raw: string; salt: string; value: unknown }>();

  for (const d of disclosureParts) {
    try {
      let base64 = d.replace(/-/g, "+").replace(/_/g, "/");
      while (base64.length % 4 !== 0) base64 += "=";
      const decoded = atob(base64);
      const parsed = JSON.parse(decoded);
      if (Array.isArray(parsed) && parsed.length >= 3) {
        map.set(parsed[1], { raw: d, salt: parsed[0], value: parsed[2] });
      }
    } catch {}
  }

  return map;
}

function getIssuerJwt(sdJwt: string): string {
  return sdJwt.split("~")[0];
}

async function createKeyBindingJwt(
  privateKeyJwk: JsonWebKey,
  nonce: string,
  audience: string,
  presentationWithoutKb: string,
): Promise<string> {
  const privateKey = await crypto.subtle.importKey(
    "jwk",
    privateKeyJwk,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"],
  );

  const encoder = new TextEncoder();
  const sdHashBytes = new Uint8Array(
    await crypto.subtle.digest(
      "SHA-256",
      encoder.encode(presentationWithoutKb),
    ),
  );
  const sdHash = base64UrlEncode(sdHashBytes);

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "ES256", typ: "kb+jwt" };
  const payload = {
    aud: audience,
    iat: now,
    exp: now + 3600,
    nonce,
    sd_hash: sdHash,
  };

  const headerB64 = base64UrlEncodeString(JSON.stringify(header));
  const payloadB64 = base64UrlEncodeString(JSON.stringify(payload));
  const signingInput = `${headerB64}.${payloadB64}`;

  const signature = new Uint8Array(
    await crypto.subtle.sign(
      { name: "ECDSA", hash: "SHA-256" },
      privateKey,
      encoder.encode(signingInput),
    ),
  );

  return `${signingInput}.${base64UrlEncode(signature)}`;
}

function Verify() {
  const [step, setStep] = useState<Step>("input");
  const [base64Input, setBase64Input] = useState("");
  const [error, setError] = useState("");
  const [request, setRequest] = useState<VerificationRequest | null>(null);
  const [matchingCredentials, setMatchingCredentials] = useState<Credential[]>(
    [],
  );
  const [selectedCredential, setSelectedCredential] =
    useState<Credential | null>(null);
  const [matchedClaims, setMatchedClaims] = useState<
    { name: string; label: string; value: string }[]
  >([]);
  const [isTrustedRelyingParty, setIsTrustedRelyingParty] = useState<
    boolean | null
  >(null);
  const [relyingPartyName, setRelyingPartyName] = useState<string | null>(null);
  const { t } = useTranslation();

  const location = useLocation();
  const navigate = useNavigate();

  const handleDecode = async (inputOverride?: string) => {
    setError("");

    const input = inputOverride ?? base64Input;

    if (!input.trim()) {
      setError(t("verify.err_empty"));
      return;
    }

    let json: string;
    try {
      json = atob(input.trim());
    } catch {
      setError(t("verify.err_invalid_base64"));
      return;
    }

    let parsed: VerificationRequest;
    try {
      parsed = JSON.parse(json);
    } catch {
      setError(t("verify.err_invalid_json"));
      return;
    }

    if (
      !Array.isArray(parsed.requested_claims) ||
      !parsed.nonce ||
      !parsed.proof_endpoint ||
      !parsed.exp
    ) {
      setError(t("verify.err_missing_fields"));
      return;
    }

    try {
      new URL(parsed.proof_endpoint);
    } catch {
      setError(t("verify.err_invalid_url"));
      return;
    }

    if (parsed.exp * 1000 < Date.now()) {
      setError(t("verify.err_expired"));
      return;
    }

    let trusted = false;
    let rpName = "";
    try {
      const url = `https://public.trusted-list.wallet.test/api/relying-party?proof_endpoint=${encodeURIComponent(parsed.proof_endpoint)}`;
      const resp = await fetch(url);
      if (resp.ok) {
        const data = await resp.json();
        trusted = true;
        rpName = data.name || new URL(parsed.proof_endpoint).hostname;
      }
    } catch {
      // Ignore fetch errors, assume untrusted
    }
    setIsTrustedRelyingParty(trusted);
    setRelyingPartyName(rpName);

    const walletData = await getData();
    const matching = walletData.credentials.filter((cred) => {
      const rawSdJwt = (cred.raw as { sd_jwt?: string })?.sd_jwt;
      if (!rawSdJwt) return false;
      const dMap = getDisclosureMap(rawSdJwt);
      return parsed.requested_claims.every((claim) => dMap.has(claim));
    });

    if (matching.length === 0) {
      setError(t("verify.err_no_credentials"));
      return;
    }

    setRequest(parsed);
    setMatchingCredentials(matching);

    if (matching.length === 1) {
      selectCredential(matching[0], parsed);
    } else {
      setStep("select-credential");
    }
  };

  useEffect(() => {
    const scannedData = (location.state as { scannedData?: string })
      ?.scannedData;
    if (scannedData) {
      setBase64Input(scannedData);
      navigate(location.pathname, { replace: true, state: {} });
      handleDecode(scannedData);
    }
  }, []);

  const selectCredential = (
    credential: Credential,
    req: VerificationRequest,
  ) => {
    const rawSdJwt = (credential.raw as { sd_jwt?: string })?.sd_jwt;
    if (!rawSdJwt) return;

    const dMap = getDisclosureMap(rawSdJwt);
    const claims = req.requested_claims
      .filter((claim) => dMap.has(claim))
      .map((claim) => ({
        name: claim,
        label: CLAIM_LABELS[claim] || claim,
        value: String(dMap.get(claim)!.value),
      }));

    setSelectedCredential(credential);
    setMatchedClaims(claims);
    setStep("review");
  };

  const handleShare = async () => {
    if (!selectedCredential || !request) return;

    setStep("submitting");

    try {
      const rawSdJwt = (selectedCredential.raw as { sd_jwt?: string })?.sd_jwt;
      const privateKeyJwk = (
        selectedCredential.raw as { private_key?: JsonWebKey }
      )?.private_key;

      if (!rawSdJwt) throw new Error("Credential has no SD-JWT data.");
      if (!privateKeyJwk) throw new Error("Credential has no signing key.");

      const issuerJwt = getIssuerJwt(rawSdJwt);
      const dMap = getDisclosureMap(rawSdJwt);

      const selectedDisclosures = request.requested_claims
        .map((claim) => dMap.get(claim)?.raw)
        .filter(Boolean);

      const presentationWithoutKb =
        issuerJwt + "~" + selectedDisclosures.join("~") + "~";

      const audience = new URL(request.proof_endpoint).origin;

      const kbJwt = await createKeyBindingJwt(
        privateKeyJwk,
        request.nonce,
        audience,
        presentationWithoutKb,
      );

      const proof = presentationWithoutKb + kbJwt;

      const response = await fetch(request.proof_endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proof }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Proof rejected (${response.status})`);
      }

      await addTransaction({
        id: Date.now(),
        credentialType: selectedCredential.type,
        credentialTitle: selectedCredential.title,
        requester: new URL(request.proof_endpoint).hostname,
        sharedAttributes: matchedClaims.map((c) => c.label),
        timestamp: new Date().toISOString(),
        status: "shared",
      });

      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit proof.");
      setStep("error");
    }
  };

  const handleDecline = async () => {
    if (selectedCredential && request) {
      await addTransaction({
        id: Date.now(),
        credentialType: selectedCredential.type,
        credentialTitle: selectedCredential.title,
        requester: new URL(request.proof_endpoint).hostname,
        sharedAttributes: matchedClaims.map((c) => c.label),
        timestamp: new Date().toISOString(),
        status: "declined",
      });
    }
    handleReset();
  };

  const handleReset = () => {
    setStep("input");
    setBase64Input("");
    setError("");
    setRequest(null);
    setMatchingCredentials([]);
    setSelectedCredential(null);
    setMatchedClaims([]);
    setIsTrustedRelyingParty(null);
    setRelyingPartyName(null);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>
        <ShieldCheck size={28} /> {t("verify.title")}
      </h1>

      {step === "input" && (
        <div className={styles.inputSection}>
          <label className={styles.label} htmlFor="base64-input">
            {t("verify.paste_label")}
          </label>
          <textarea
            id="base64-input"
            className={styles.textarea}
            rows={6}
            value={base64Input}
            onChange={(e) => setBase64Input(e.target.value)}
            placeholder={t("verify.paste_placeholder")}
            spellCheck={false}
          />
          {error && <p className={styles.error}>{error}</p>}
          <button
            className={styles.verifyButton}
            onClick={() => handleDecode()}
            disabled={!base64Input.trim()}
          >
            {t("verify.decode_button")}
          </button>
        </div>
      )}

      {step === "select-credential" && request && (
        <div className={styles.reviewSection}>
          <p className={styles.rpInfo}>
            <strong>{new URL(request.proof_endpoint).hostname}</strong> is
            requesting proof of:{" "}
            <strong>
              {request.requested_claims
                .map((c) => CLAIM_LABELS[c] || c)
                .join(", ")}
            </strong>
          </p>

          {isTrustedRelyingParty ? (
            <div className={styles.infoMessage}>
              <Info size={20} className={styles.messageIcon} />
              <span>
                {t("verify.trusted_party", { name: relyingPartyName })}
              </span>
            </div>
          ) : (
            <div className={styles.warningMessage}>
              <AlertTriangle size={20} className={styles.messageIcon} />
              <span>{t("verify.untrusted_party")}</span>
            </div>
          )}

          <p className={styles.label}>{t("verify.select_credential")}</p>

          <div className={styles.credentialList}>
            {matchingCredentials.map((cred) => (
              <button
                key={cred.id}
                className={styles.credentialCard}
                onClick={() => selectCredential(cred, request)}
              >
                <span className={styles.credType}>{cred.title}</span>
                <span className={styles.issuer}>
                  {t("verify.issued_by", { name: cred.issuer.name })}
                </span>
              </button>
            ))}
          </div>

          <button className={styles.cancelButton} onClick={handleReset}>
            {t("verify.cancel")}
          </button>
        </div>
      )}

      {step === "review" && selectedCredential && request && (
        <div className={styles.reviewSection}>
          <p className={styles.rpInfo}>
            <strong>{new URL(request.proof_endpoint).hostname}</strong> is
            requesting the following claims from your{" "}
            <strong>{selectedCredential.title}</strong>:
          </p>

          {isTrustedRelyingParty ? (
            <div className={styles.infoMessage}>
              <Info size={20} className={styles.messageIcon} />
              <span>
                {t("verify.trusted_party", { name: relyingPartyName })}
              </span>
            </div>
          ) : (
            <div className={styles.warningMessage}>
              <AlertTriangle size={20} className={styles.messageIcon} />
              <span>{t("verify.untrusted_party")}</span>
            </div>
          )}

          <div className={styles.credentialInfo}>
            <span className={styles.credType}>{selectedCredential.title}</span>
            <span className={styles.issuer}>
              {t("verify.issued_by", { name: selectedCredential.issuer.name })}
            </span>
          </div>

          <div className={styles.attributeList}>
            <div className={styles.claimHeader}>
              <span>{t("verify.claim")}</span>
              <span>{t("verify.value")}</span>
            </div>
            {matchedClaims.map((claim) => (
              <div
                key={claim.name}
                className={`${styles.claimRow} ${styles.requested}`}
              >
                <span className={styles.attrName}>
                  {t(`claims.${claim.name}`, { defaultValue: claim.label })}
                  <span className={styles.requiredBadge}>
                    {t("verify.requested_badge")}
                  </span>
                </span>
                <span className={styles.attrValue}>{claim.value}</span>
              </div>
            ))}
          </div>

          <div className={styles.actions}>
            <button className={styles.cancelButton} onClick={handleDecline}>
              {t("verify.decline")}
            </button>
            <button className={styles.shareButton} onClick={handleShare}>
              {t("verify.share_claims", { count: matchedClaims.length })}
            </button>
          </div>
        </div>
      )}

      {step === "submitting" && (
        <div className={styles.successSection}>
          <Loader2 size={48} className={styles.spinner} />
          <h2 className={styles.successTitle}>{t("verify.submitting")}</h2>
        </div>
      )}

      {step === "success" && (
        <div className={styles.successSection}>
          <div className={styles.successIcon}>
            <ShieldCheck size={48} />
          </div>
          <h2 className={styles.successTitle}>{t("verify.success_title")}</h2>
          <p className={styles.successText}>
            {t("verify.success_text", {
              hostname: request
                ? new URL(request.proof_endpoint).hostname
                : "the relying party",
            })}
          </p>
          <ul className={styles.sharedList}>
            {matchedClaims.map((claim) => (
              <li key={claim.name} className={styles.sharedItem}>
                <span className={styles.sharedLabel}>
                  {t(`claims.${claim.name}`, { defaultValue: claim.label })}
                </span>
                <span className={styles.sharedValue}>{claim.value}</span>
              </li>
            ))}
          </ul>
          <button className={styles.resetButton} onClick={handleReset}>
            {t("verify.new_verification")}
          </button>
        </div>
      )}

      {step === "error" && (
        <div className={styles.successSection}>
          <h2 className={styles.successTitle}>{t("verify.error_title")}</h2>
          <p className={styles.error}>{error}</p>
          <button className={styles.resetButton} onClick={handleReset}>
            {t("common.try_again")}
          </button>
        </div>
      )}
    </div>
  );
}

export default Verify;
