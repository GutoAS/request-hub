import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { createQueryClient } from "./api/queryClient";
import { AppAuthProvider } from "./auth/AppAuthProvider";
import { App } from "./App";
import "./styles/global.css";

async function enableMocking() {
  if (import.meta.env.VITE_ENABLE_MOCKS !== "true") {
    return;
  }
  const { worker } = await import("./mocks/browser");

  await worker.start({ onUnhandledFrame: "bypass" });
}

const queryClient = createQueryClient();

function renderApp() {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppAuthProvider>
            <App />
          </AppAuthProvider>
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </StrictMode>,
  );
}

enableMocking()
  .catch((error) => console.error("Could not start the mock API", error))
  .then(renderApp);
