import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { QrCode, Camera } from "lucide-react";
import styles from "../components/ScanPage/Scan.module.css";
import { useTranslation } from "react-i18next";

type ScanState = "prompt" | "scanning" | "denied" | "error";

function Scan() {
  const [state, setState] = useState<ScanState>("prompt");
  const [error, setError] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const shouldStartRef = useRef(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const startScanner = () => {
    setError("");
    shouldStartRef.current = true;
    setState("scanning");
  };

  const safeStopScanner = async () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    if (!scanner) return;
    try {
      if (scanner.getState() === Html5QrcodeScannerState.SCANNING) {
        await scanner.stop();
      }
    } catch {
      /* ignore */
    }
    try {
      scanner.clear();
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    if (state !== "scanning" || !shouldStartRef.current) return;
    shouldStartRef.current = false;

    const init = async () => {
      try {
        const scanner = new Html5Qrcode("qr-reader");
        scannerRef.current = scanner;

        const wrapper = document.getElementById("qr-reader");
        const wrapperWidth = wrapper?.clientWidth ?? 250;
        const qrSize = Math.max(160, Math.min(250, wrapperWidth - 32));

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: qrSize, height: qrSize } },
          (decodedText) => {
            void safeStopScanner();
            navigate("/verify", { state: { scannedData: decodedText } });
          },
          () => {},
        );
      } catch (err) {
        await safeStopScanner();
        const message = err instanceof Error ? err.message : String(err);
        if (
          message.includes("Permission") ||
          message.includes("NotAllowedError")
        ) {
          setState("denied");
          setError(t("scan.camera_denied"));
        } else {
          setState("error");
          setError(message || "Failed to start camera.");
        }
      }
    };

    init();
  }, [state, navigate]);

  const stopScanner = async () => {
    await safeStopScanner();
    setState("prompt");
  };

  useEffect(() => {
    return () => {
      void safeStopScanner();
    };
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>
        <QrCode size={28} /> {t("scan.title")}
      </h1>

      {state === "prompt" && (
        <div className={styles.permissionSection}>
          <Camera size={48} className={styles.permissionIcon} />
          <p className={styles.permissionText}>{t("scan.description")}</p>
          <button className={styles.startButton} onClick={startScanner}>
            {t("scan.start")}
          </button>
        </div>
      )}

      {state === "scanning" && (
        <div className={styles.scannerSection}>
          <p className={styles.description}>{t("scan.point_camera")}</p>
          <div className={styles.scannerWrapper}>
            <div id="qr-reader" />
          </div>
          <button className={styles.stopButton} onClick={stopScanner}>
            {t("scan.stop")}
          </button>
        </div>
      )}

      {(state === "denied" || state === "error") && (
        <div className={styles.permissionSection}>
          <Camera size={48} className={styles.permissionIcon} />
          <p className={styles.error}>{error}</p>
          <button className={styles.startButton} onClick={startScanner}>
            {t("scan.try_again")}
          </button>
        </div>
      )}
    </div>
  );
}

export default Scan;
