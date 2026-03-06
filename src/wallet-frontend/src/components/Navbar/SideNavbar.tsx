import { NavLink } from "react-router-dom";
import { CreditCard, QrCode, Settings, LogOut } from "lucide-react";
import styles from "./SideNavbar.module.css";

const navItems = [
  { to: "/credentials", icon: CreditCard, label: "Credentials" },
  { to: "/scan", icon: QrCode, label: "Scan" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

function SideNavbar() {
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
        <button className={styles.logoutButton}>
          <LogOut size={20} className={styles.navIcon} />
          <span className={styles.navLabel}>Logout</span>
        </button>
      </div>
    </nav>
  );
}

export default SideNavbar;
