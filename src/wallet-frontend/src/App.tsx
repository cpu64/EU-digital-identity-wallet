import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import TopNavbar from "./components/Navbar/TopNavbar";
import SideNavbar from "./components/Navbar/SideNavbar";
import styles from "./App.module.css";
import Credentials from "./pages/Credentials";
import CredentialDetail from "./pages/CredentialDetail";
import Verify from "./pages/Verify";
import Transactions from "./pages/Transactions";
import LoginUser from "./pages/Login";
import { useEffect, useState } from "react";
import RegisterUser from "./pages/Register";
import PidProviders from "./pages/PidProviders";
import PidCallback from "./pages/PidCallback";
import SignDocument from "./pages/SignDocument";
import Scan from "./pages/Scan";
import Protected from "./pages/Protected";

function AppRoutes({
  setToken,
  setSidebarOpen,
}: {
  setToken: (t: string | null) => void;
  setSidebarOpen: (v: boolean) => void;
}) {
  const location = useLocation();
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname, setSidebarOpen]);

  return (
    <Routes>
      <Route path="/login" element={<LoginUser setToken={setToken} />} />
      <Route path="/register" element={<RegisterUser />} />

      <Route
        path="/"
        element={
          <Protected>
            <Navigate to="/credentials" replace />
          </Protected>
        }
      />
      <Route
        path="/credentials"
        element={
          <Protected>
            <Credentials />
          </Protected>
        }
      />
      <Route
        path="/credentials/:id"
        element={
          <Protected>
            <CredentialDetail />
          </Protected>
        }
      />
      <Route
        path="/verify"
        element={
          <Protected>
            <Verify />
          </Protected>
        }
      />
      <Route
        path="/transactions"
        element={
          <Protected>
            <Transactions />
          </Protected>
        }
      />
      <Route
        path="/pid-providers"
        element={
          <Protected>
            <PidProviders />
          </Protected>
        }
      />
      <Route
        path="/pid-callback"
        element={
          <Protected>
            <PidCallback />
          </Protected>
        }
      />
      <Route
        path="/sign"
        element={
          <Protected>
            <SignDocument />
          </Protected>
        }
      />
      <Route
        path="/scan"
        element={
          <Protected>
            <Scan />
          </Protected>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  const [token, setToken] = useState(sessionStorage.getItem("token"));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={styles.appWrapper}>
      {token && (
        <TopNavbar
          setToken={setToken}
          onMenuClick={() => setSidebarOpen((v) => !v)}
          sidebarOpen={sidebarOpen}
        />
      )}
      {token && (
        <SideNavbar
          setToken={setToken}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}
      {token && (
        <div
          className={`${styles.backdrop} ${sidebarOpen ? styles.backdropOpen : ""}`}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <main className={styles.mainContent}>
        <AppRoutes setToken={setToken} setSidebarOpen={setSidebarOpen} />
      </main>
    </div>
  );
}

export default App;
