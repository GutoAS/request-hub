import { createContext, useContext } from "react";

export interface SessionUser {
  name: string;
  email?: string;
}

export type SessionStatus = "loading" | "signedIn" | "signedOut";

export interface Session {
  status: SessionStatus;
  user?: SessionUser;
  expired: boolean;
  error?: string;
  returnTo?: string;
  signIn: (returnTo?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const SessionContext = createContext<Session | null>(null);

export function useSession(): Session {
  const session = useContext(SessionContext);
  if (!session)
    throw new Error("useSession() must be used inside <AppAuthProvider>");
  return session;
}
