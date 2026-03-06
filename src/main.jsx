// main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ServerWake from "./components/ServerWake";
import App from "./App";
import "./App.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ServerWake>
          <App />
        </ServerWake>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);