import { User, Sun, Moon } from "lucide-react";
import styles from "./TopNavbar.module.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";

type UseSessionTimeoutOptions = {
  idleMs: number;
  warningMs: number;
  onLogout: () => void;
};

function useSessionTimeout({
  idleMs,
  warningMs,
  onLogout,
}: UseSessionTimeoutOptions) {
  const [showWarning, setShowWarning] = useState(false);

  const idleTimerRef = useRef<number | null>(null);
  const warningTimerRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (idleTimerRef.current !== null) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
    if (warningTimerRef.current !== null) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
  }, []);

  const startIdleTimer = useCallback(() => {
    clearTimers();
    idleTimerRef.current = window.setTimeout(() => {
      setShowWarning(true);
      warningTimerRef.current = window.setTimeout(() => {
        setShowWarning(false);
        onLogout();
      }, warningMs);
    }, idleMs);
  }, [clearTimers, idleMs, warningMs, onLogout]);

  const continueSession = useCallback(() => {
    setShowWarning(false);
    startIdleTimer();
  }, [startIdleTimer]);

  const logoutNow = useCallback(() => {
    clearTimers();
    setShowWarning(false);
    onLogout();
  }, [clearTimers, onLogout]);

  useEffect(() => {
    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
    ];

    const onActivity = () => {
      if (!showWarning) startIdleTimer();
    };

    events.forEach((event) =>
      window.addEventListener(event, onActivity, { passive: true }),
    );

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible" && !showWarning) {
        startIdleTimer();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    startIdleTimer();

    return () => {
      clearTimers();
      events.forEach((event) => window.removeEventListener(event, onActivity));
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [clearTimers, startIdleTimer, showWarning]);

  return { showWarning, continueSession, logoutNow };
}

function TopNavbar({ setToken }: { setToken: (t: string | null) => void }) {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setShowProfile(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { showWarning, continueSession, logoutNow } = useSessionTimeout({
    idleMs: 60 * 1000,
    warningMs: 30 * 1000,
    onLogout: () => {
      sessionStorage.removeItem("token");
      setToken(null);
      navigate("/");
    },
  });

  const toggleLanguage = () => {
    const next = currentLang === "en" ? "lt" : "en";
    i18n.changeLanguage(next);
    localStorage.setItem("language", next);
    setCurrentLang(next);
  };

  return (
    <>
      <Dialog open={showWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("navbar.session_expiring_title")}</DialogTitle>
            <DialogDescription>
              {t("navbar.session_expiring_body")}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="sm:justify-center">
            <Button type="button" onClick={continueSession}>
              {t("navbar.continue_session")}
            </Button>
            <Button type="button" variant="destructive" onClick={logoutNow}>
              {t("navbar.log_out")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <header className={styles.topNavbar}>
        <div className={styles.logoContainer}>
          <img
            src="/images/wallet-logo.png"
            alt="Wallet Logo"
            className={styles.logo}
          />
          {t("navbar.app_name")}
        </div>
        <div className={styles.navActions}>
          <button
            className={styles.themeToggle}
            aria-label={t("navbar.toggle_theme")}
            onClick={toggleTheme}
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            className={styles.themeToggle}
            aria-label={t("navbar.language")}
            onClick={toggleLanguage}
            title={t("navbar.language")}
          >
            {currentLang === "en" ? "LT" : "EN"}
          </button>
          <div ref={profileRef} className={styles.profileWrapper}>
            <button
              className={styles.profileButton}
              aria-label={t("navbar.profile")}
              onClick={() => setShowProfile((v) => !v)}
            >
              <User size={22} />
            </button>
            {showProfile && (
              <div className={styles.profilePopover}>
                {sessionStorage.getItem("username") || "Unknown user"}
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}

export default TopNavbar;
