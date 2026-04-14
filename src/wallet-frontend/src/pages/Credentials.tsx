import Credential from "../components/Credential/Credential";
import { getData, type WalletData } from "@/data/wallet_data";
import styles from "../components/CredentialsPage/Credentials.module.css";
import { Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Credentials() {
  const navigate = useNavigate();
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [error, setError] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setWalletData(await getData());
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const filteredCredentials = walletData?.credentials.filter((credential) => {
    const q = searchQuery.toLowerCase();
    return (
      credential.title.toLowerCase().includes(q) ||
      credential.issuer.name.toLowerCase().includes(q) ||
      credential.type.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className={styles.searchBar}>
        <Search size={18} className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search credentials..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>
      <div className={styles.grid}>
        {filteredCredentials?.map((credential) => (
          <Credential key={credential.id} credential={credential} />
        ))}
        <button
          className={styles.addCard}
          onClick={() => navigate("/pid-providers")}
        >
          <Plus size={48} />
        </button>
      </div>
    </div>
  );
}

export default Credentials;
