import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import AlertsPage from "./pages/AlertsPage.jsx";

function isLoggedIn() {
  return Boolean(localStorage.getItem("access_token"));
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          isLoggedIn() ? <Navigate to="/alerts" replace /> : <Navigate to="/login" replace />
        }
      />
      <Route
        path="/login"
        element={isLoggedIn() ? <Navigate to="/alerts" replace /> : <LoginPage />}
      />
      <Route
        path="/alerts"
        element={isLoggedIn() ? <AlertsPage /> : <Navigate to="/login" replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
