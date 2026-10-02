import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Button } from "../components/Button";
import { ErrorMessage } from "../components/ErrorMessage";
import { authMode } from "./oidcConfig";
import { useSession } from "./session";
import styles from "./LoginPage.module.css";
import { FaServicestack } from "react-icons/fa6";

export function LoginPage() {
  const session = useSession();
  const location = useLocation();
  const [redirecting, setRedirecting] = useState(false);
  const returnTo =
    (location.state as { from?: string } | null)?.from ?? "/requests";

  if (session.status === "signedIn") {
    return <Navigate to={returnTo} replace />;
  }

  async function handleSignIn() {
    setRedirecting(true);
    await session.signIn(returnTo);
    setRedirecting(false);
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.logo}>
          <span className={styles.logoMark} aria-hidden="true">
            <FaServicestack />
          </span>
          Request Hub
        </div>
        <div>
          <h1 className={styles.headline}>
            One Hub for Every Customer Request.
          </h1>
          <p className={styles.lead}>
            Everything your team needs to receive, track, and resolve
            requests—right in one place.
          </p>
        </div>
        <p className={styles.footnote}>Developed By Agostinho Soberano</p>
      </section>

      <section className={styles.panel}>
        <div className={styles.card}>
          <h2 className={styles.title}>Access Your Workspace</h2>
          <p className={styles.subtitle}>
            Sign in to access your workspace and manage requests from start to
            resolution.
          </p>

          <Button
            variant="primary"
            fullWidth
            onClick={handleSignIn}
            disabled={redirecting || session.status === "loading"}
          >
            {redirecting ? "Redirecting…" : "Sign in"}
          </Button>

          {session.expired && (
            <div className={styles.alert}>
              <ErrorMessage
                title="Your session expired."
                detail="Please sign in again to continue."
              />
            </div>
          )}
          {session.error && (
            <div className={styles.alert}>
              <ErrorMessage title="Sign-in problem" detail={session.error} />
            </div>
          )}

          <p className={styles.help}>
            {authMode === "mock"
              ? "Demo mode: no sign-in server is configured, so you sign in as a demo user."
              : "Your password is securely managed by your identity provider."}
          </p>
        </div>
      </section>
    </div>
  );
}
