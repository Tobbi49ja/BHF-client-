import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ServerWake from "./components/ServerWake";
import FloatingChat from "./components/FloatingChat";
import CookieBanner from "./components/CookieBanner";
import App from "./App";
import "./App.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ServerWake>
          <App />
          <FloatingChat />
          <CookieBanner />
        </ServerWake>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);