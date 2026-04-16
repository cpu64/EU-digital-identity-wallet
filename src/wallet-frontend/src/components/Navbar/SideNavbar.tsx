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

const navItems = [
  { to: "/credentials", icon: CreditCard, label: "Credentials" },
  { to: "/pid-providers", icon: Building2, label: "PID Providers" },
  { to: "/verify", icon: ShieldCheck, label: "Verify" },
  { to: "/transactions", icon: ArrowLeftRight, label: "Transactions" },
  { to: "/scan", icon: QrCode, label: "Scan" },
  { to: "/sign", icon: Signature, label: "Document Signing" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

function removeToken() {
  sessionStorage.removeItem("token");
}

function SideNavbar({ setToken }: { setToken: (t: string | null) => void }) {
  const navigate = useNavigate();

  return (
    <nav className={styles.sideNavbar}>
      <ul className={styles.navList}>
        {navItems.map((item) => (
          <li key={item.to} className={styles.navItem}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ""}`
              }
              end={item.to === "/"}
            >
              <item.icon size={20} className={styles.navIcon} />
              <span className={styles.navLabel}>{item.label}</span>
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
            navigate("/");
          }}
        >
          <LogOut size={20} className={styles.navIcon} />
          <span className={styles.navLabel}>Logout</span>
        </button>
      </div>
    </nav>
  );
}

export default SideNavbar;
