import { Navigate, Route, Routes } from "react-router-dom";
import { AuthCallbackPage } from "./auth/AuthCallbackPage";
import { LoginPage } from "./auth/LoginPage";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { Layout } from "./components/Layout/Layout";
import { CreateRequestPage } from "./features/requests/CreateRequestPage";
import { RequestDetailPage } from "./features/requests/RequestDetailPage";
import { RequestListPage } from "./features/requests/RequestListPage";
import { ApiPlaygroundPage } from "./pages/ApiPlaygroundPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { UiKitPage } from "./pages/UiKitPage";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/requests" replace />} />
          <Route path="/requests" element={<RequestListPage />} />
          <Route path="/requests/new" element={<CreateRequestPage />} />
          <Route path="/requests/:requestId" element={<RequestDetailPage />} />
          {import.meta.env.DEV && (
            <Route path="/dev/ui-kit" element={<UiKitPage />} />
          )}
          {import.meta.env.DEV && (
            <Route path="/dev/api" element={<ApiPlaygroundPage />} />
          )}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
