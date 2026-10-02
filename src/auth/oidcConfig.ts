import { UserManager, WebStorageStateStore } from "oidc-client-ts";

const env = import.meta.env;

export const authMode: "oidc" | "mock" | "missing" = env.VITE_OIDC_AUTHORITY
  ? "oidc"
  : env.VITE_ENABLE_MOCKS === "true"
    ? "mock"
    : "missing";

let userManager: UserManager | undefined;

export function getUserManager(): UserManager {
  userManager ??= new UserManager({
    authority: env.VITE_OIDC_AUTHORITY ?? "",
    client_id: env.VITE_OIDC_CLIENT_ID ?? "",
    redirect_uri:
      env.VITE_OIDC_REDIRECT_URI || `${window.location.origin}/auth/callback`,
    post_logout_redirect_uri: `${window.location.origin}/login`,
    scope: env.VITE_OIDC_SCOPE || "openid profile email",

    userStore: new WebStorageStateStore({ store: window.sessionStorage }),

    automaticSilentRenew: true,
  });
  return userManager;
}
