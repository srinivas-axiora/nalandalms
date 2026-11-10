import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-950 font-semibold text-white">Loading Nalanda...</div>}>
      <App />
    </Suspense>
  </StrictMode>
);
