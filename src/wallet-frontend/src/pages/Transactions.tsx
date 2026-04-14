import { useEffect, useState } from "react";
import styles from "../components/TransactionsPage/Transactions.module.css";
import { getData, type WalletData } from "@/data/wallet_data";

function Transactions() {
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setWalletData(await getData());

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  const filteredTransactions = walletData?.transactions.filter((txn) => {
    const txnDate = new Date(txn.timestamp);
    if (dateFrom && txnDate < new Date(dateFrom)) return false;
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      if (txnDate > end) return false;
    }
    return true;
  });

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Transactions</h1>

      <div className={styles.filters}>
        <label className={styles.filterLabel}>
          From
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className={styles.dateInput}
          />
        </label>
        <label className={styles.filterLabel}>
          To
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className={styles.dateInput}
          />
        </label>
        {(dateFrom || dateTo) && (
          <button
            className={styles.clearFilter}
            onClick={() => {
              setDateFrom("");
              setDateTo("");
            }}
          >
            Clear
          </button>
        )}
      </div>

      {filteredTransactions?.length === 0 ? (
        <p className={styles.empty}>No transactions found.</p>
      ) : (
        <div className={styles.list}>
          <div className={styles.headerRow}>
            <span className={styles.headerCell}>Requester</span>
            <span className={styles.headerCell}>Credential</span>
            <span className={styles.headerCell}>Date</span>
            <span className={styles.headerCell}>Status</span>
          </div>

          {filteredTransactions?.map((txn) => (
            <div key={txn.id} className={styles.row}>
              <span className={styles.requesterName}>{txn.requester}</span>

              <div className={styles.credential}>
                <span className={styles.credentialTitle}>
                  {txn.credentialTitle}
                </span>
                <div className={styles.attributes}>
                  {txn.sharedAttributes.map((attr) => (
                    <span key={attr} className={styles.attributeTag}>
                      {attr}
                    </span>
                  ))}
                </div>
              </div>

              <span className={styles.timestamp}>
                {formatDate(txn.timestamp)}
              </span>

              <span
                className={`${styles.statusBadge} ${
                  txn.status === "shared"
                    ? styles.statusShared
                    : styles.statusDeclined
                }`}
              >
                {txn.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Transactions;
