import { Navigate } from "react-router-dom";
import { Spinner } from "../components/Spinner";
import { useSession } from "./session";

export function AuthCallbackPage() {
  const session = useSession();

  if (session.status === "loading") {
    return (
      <div style={{ paddingTop: "30vh" }}>
        <Spinner label="Signing you in…" />
      </div>
    );
  }

  if (session.status === "signedIn") {
    return <Navigate to={session.returnTo ?? "/requests"} replace />;
  }

  return <Navigate to="/login" replace />;
}
