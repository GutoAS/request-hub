import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Spinner } from "../components/Spinner";
import { useSession } from "./session";

export function ProtectedRoute() {
  const session = useSession();
  const location = useLocation();

  if (session.status === "loading") {
    return (
      <div style={{ paddingTop: "30vh" }}>
        <Spinner label="Checking your sign-in…" />
      </div>
    );
  }

  if (session.status === "signedOut") {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  return <Outlet />;
}
