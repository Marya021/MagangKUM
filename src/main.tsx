import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { showError } from "@/lib/error-utils";

// Global handlers for uncaught errors and unhandled promise rejections
window.addEventListener("error", (event) => {
  // Ignore ResizeObserver loop benign warning
  if (event.message?.includes("ResizeObserver")) return;
  // eslint-disable-next-line no-console
  console.error("[window.error]", event.error || event.message);
});

window.addEventListener("unhandledrejection", (event) => {
  // eslint-disable-next-line no-console
  console.error("[unhandledrejection]", event.reason);
  showError(event.reason, "Terjadi kesalahan tak terduga");
});

createRoot(document.getElementById("root")!).render(<App />);
