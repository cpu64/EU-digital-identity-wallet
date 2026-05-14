import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import "./i18n";
import "./styles/global.css";
import "./index.css";
import App from "./App.tsx";

const baseTag = document.querySelector('base');
const basename = baseTag ? new URL(baseTag.href).pathname : '/';

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
