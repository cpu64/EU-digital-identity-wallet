import { NavLink, useNavigate } from "react-router-dom";
import {
  CreditCard,
  QrCode,
  Settings,
  LogOut,
  ShieldCheck,
  ArrowLeftRight,
  Building2,
  Signature,
} from "lucide-react";
import styles from "./SideNavbar.module.css";
import { useTranslation } from "react-i18next";

const navItems = [
  { to: "/credentials", icon: CreditCard, labelKey: "sidenav.credentials" },
  { to: "/pid-providers", icon: Building2, labelKey: "sidenav.pid_providers" },
  { to: "/verify", icon: ShieldCheck, labelKey: "sidenav.verify" },
  {
    to: "/transactions",
    icon: ArrowLeftRight,
    labelKey: "sidenav.transactions",
  },
  { to: "/scan", icon: QrCode, labelKey: "sidenav.scan" },
  { to: "/sign", icon: Signature, labelKey: "sidenav.document_signing" },
  { to: "/settings", icon: Settings, labelKey: "sidenav.settings" },
];

function removeToken() {
  sessionStorage.removeItem("token");
}

function SideNavbar({
  setToken,
  open = false,
  onClose,
}: {
  setToken: (t: string | null) => void;
  open?: boolean;
  onClose?: () => void;
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <nav
      className={`${styles.sideNavbar} ${open ? styles.open : ""}`}
      aria-hidden={!open ? undefined : "false"}
    >
      <ul className={styles.navList}>
        {navItems.map((item) => (
          <li key={item.to} className={styles.navItem}>
            <NavLink
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ""}`
              }
              end={item.to === "/"}
            >
              <item.icon size={20} className={styles.navIcon} />
              <span className={styles.navLabel}>{t(item.labelKey)}</span>
            </NavLink>
          </li>
        ))}
      </ul>
      <div className={styles.logoutContainer}>
        <button
          className={styles.logoutButton}
          onClick={() => {
            removeToken();
            setToken(null);
            onClose?.();
            navigate("/");
          }}
        >
          <LogOut size={20} className={styles.navIcon} />
          <span className={styles.navLabel}>{t("sidenav.logout")}</span>
        </button>
      </div>
    </nav>
  );
}

export default SideNavbar;
