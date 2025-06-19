import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { initializeTheme } from "@/hooks/useTheme";

import { TempoDevtools } from "tempo-devtools";
TempoDevtools.init();

// Initialize theme before rendering
initializeTheme();

// PWA Service Worker Registration
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    // Use a timeout to ensure the app is fully loaded
    setTimeout(() => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered: ", registration);
        })
        .catch((registrationError) => {
          console.warn(
            "SW registration failed (this is normal in development):",
            registrationError.message,
          );
        });
    }, 1000);
  });
}

// Use empty string as basename if BASE_URL is undefined
const basename = import.meta.env.BASE_URL || "";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
