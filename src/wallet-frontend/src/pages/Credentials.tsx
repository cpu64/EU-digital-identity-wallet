import Credential from "../components/Credential/Credential";
import { mockCredentials } from "@/data/mock-credentials";
import styles from "../components/CredentialsPage/Credentials.module.css";
import { Plus } from "lucide-react";

function Credentials() {
  return (
    <div className={styles.grid}>
      {mockCredentials.map((credential) => (
        <Credential key={credential.id} credential={credential} />
      ))}
      <button className={styles.addCard}>
        <Plus size={48} />
      </button>
    </div>
  );
}

export default Credentials;
