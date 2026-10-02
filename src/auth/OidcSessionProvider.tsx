import { useQueryClient } from "@tanstack/react-query";
import type { User, UserManager } from "oidc-client-ts";
import { useEffect, useState, type ReactNode } from "react";
import { AuthProvider, useAuth } from "react-oidc-context";
import { setUnauthorizedHandler } from "../api/client";
import { setAccessTokenGetter } from "./accessToken";
import { getUserManager } from "./oidcConfig";
import { SessionContext, type Session } from "./session";

interface SignInState {
  returnTo?: string;
}

export function OidcSessionProvider({ children }: { children: ReactNode }) {
  const [returnTo, setReturnTo] = useState<string>();
  const [userManager] = useState(() => {
    const manager = getUserManager();
    setAccessTokenGetter(() => readAccessToken(manager));
    return manager;
  });

  return (
    <AuthProvider
      userManager={userManager}
      onSigninCallback={(user) => {
        setReturnTo(
          (user?.state as SignInState | undefined)?.returnTo ?? "/requests",
        );
      }}
    >
      <OidcSession userManager={userManager} returnTo={returnTo}>
        {children}
      </OidcSession>
    </AuthProvider>
  );
}

interface OidcSessionProps {
  userManager: UserManager;
  returnTo?: string;
  children: ReactNode;
}

function OidcSession({ userManager, returnTo, children }: OidcSessionProps) {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setExpired(true);
      void userManager.removeUser();
    });
  }, [userManager]);

  const profile = auth.user?.profile;
  const session: Session = {
    status: auth.isLoading
      ? "loading"
      : auth.isAuthenticated
        ? "signedIn"
        : "signedOut",
    user: profile && {
      name:
        profile.name ??
        profile.preferred_username ??
        profile.email ??
        "Signed in",
      email: profile.email,
    },
    expired,
    error: errorText(auth.error?.source),
    returnTo,
    signIn: async (returnTo = "/requests") => {
      setExpired(false);
      await auth.signinRedirect({ state: { returnTo } satisfies SignInState });
    },
    signOut: async () => {
      queryClient.clear();
      await auth.signoutRedirect();
    },
  };

  return <SessionContext value={session}>{children}</SessionContext>;
}

let renewal: Promise<User | null> | undefined;

async function readAccessToken(
  userManager: UserManager,
): Promise<string | undefined> {
  const user = await userManager.getUser();
  if (!user) return undefined;
  if (!user.expired) return user.access_token;

  try {
    renewal ??= userManager.signinSilent().finally(() => (renewal = undefined));
    return (await renewal)?.access_token;
  } catch {
    return undefined;
  }
}

function errorText(source: string | undefined): string | undefined {
  if (source === "signinRedirect")
    return "We couldn't reach the sign-in service. Please try again in a moment.";
  if (source === "signinCallback")
    return "Sign-in didn't complete. Please try again.";
  return undefined;
}
