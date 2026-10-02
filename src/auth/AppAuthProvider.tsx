import type { ReactNode } from "react";
import { ErrorMessage } from "../components/ErrorMessage";
import { MockSessionProvider } from "./MockSessionProvider";
import { OidcSessionProvider } from "./OidcSessionProvider";
import { authMode } from "./oidcConfig";

export function AppAuthProvider({ children }: { children: ReactNode }) {
  if (authMode === "oidc")
    return <OidcSessionProvider>{children}</OidcSessionProvider>;
  if (authMode === "mock")
    return <MockSessionProvider>{children}</MockSessionProvider>;
  return (
    <div style={{ maxWidth: 640, margin: "64px auto", padding: "0 16px" }}>
      <ErrorMessage
        title="Sign-in is not configured."
        detail="Set VITE_OIDC_AUTHORITY and VITE_OIDC_CLIENT_ID (see .env.example), or turn on the fake API with VITE_ENABLE_MOCKS=true."
      />
    </div>
  );
}
