import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./modules/auth/context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import "./index.css";
import App from "./app/App";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
    <ToastProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>
);