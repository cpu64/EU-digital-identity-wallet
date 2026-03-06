import { User } from "lucide-react";
import styles from "./TopNavbar.module.css";

function TopNavbar() {
  return (
    <header className={styles.topNavbar}>
      <div className={styles.logoContainer}>
        <img
          src="/images/eu-logo.svg"
          alt="EU Digital Identity Wallet"
          className={styles.logo}
        />
      </div>
      <button className={styles.profileButton} aria-label="Profile">
        <User size={22} />
      </button>
    </header>
  );
}

export default TopNavbar;
