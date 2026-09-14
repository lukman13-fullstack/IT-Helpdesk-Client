import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { Provider } from "react-redux";
import store from "./store";
import { initAuthUserFromToken } from "@/store/authUser/action";
import type { AppDispatch } from "@/store";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import { Toaster } from "sonner";

function Root() {
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);

  useEffect(() => {
    (store.dispatch as AppDispatch)(initAuthUserFromToken()).finally(() => {
      setIsAuthInitialized(true);
    });
  }, []);

  if (!isAuthInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Provider store={store}>
      <ThemeProvider>
        <LanguageProvider>
          <App />
          <Toaster position="top-right" />
        </LanguageProvider>
      </ThemeProvider>
    </Provider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
