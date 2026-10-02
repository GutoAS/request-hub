import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { setUnauthorizedHandler } from "../api/client";
import { SessionContext, type Session } from "./session";

const DEMO_USER = { name: "Agostinho Soberano", email: "soberano@gmail.com" };
const SIGNED_OUT_KEY = "demoAuth.signedOut";

export function MockSessionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [signedIn, setSignedIn] = useState(() => readSignedOut() !== "true");
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setExpired(true);
      setSignedIn(false);
    });
  }, []);

  const session: Session = {
    status: signedIn ? "signedIn" : "signedOut",
    user: signedIn ? DEMO_USER : undefined,
    expired,
    signIn: async (returnTo = "/requests") => {
      writeSignedOut("false");
      setExpired(false);
      setSignedIn(true);
      navigate(returnTo, { replace: true });
    },
    signOut: async () => {
      queryClient.clear();
      writeSignedOut("true");
      setSignedIn(false);
      navigate("/login", { replace: true });
    },
  };

  return <SessionContext value={session}>{children}</SessionContext>;
}

function readSignedOut() {
  try {
    return sessionStorage.getItem(SIGNED_OUT_KEY);
  } catch {
    return null;
  }
}

function writeSignedOut(value: "true" | "false") {
  try {
    sessionStorage.setItem(SIGNED_OUT_KEY, value);
  } catch {}
}
