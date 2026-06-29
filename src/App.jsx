import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/auth.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import QueuePage from "./pages/QueuePage.jsx";
import CustomerProfilePage from "./pages/CustomerProfilePage.jsx";
import AdminDashboardPage from "./pages/AdminDashboardPage.jsx";
import AdminInsightsPage from "./pages/AdminInsightsPage.jsx";
import AdminCustomersPage from "./pages/AdminCustomersPage.jsx";
import AdminAgentsPage from "./pages/AdminAgentsPage.jsx";
import AppShell from "./components/AppShell.jsx";

function Protected({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/queue" replace />;
  return children;
}

function FullScreenLoader() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: 14 }}>
      Loading…
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <Protected>
                <AppShell />
              </Protected>
            }
          >
            <Route index element={<Navigate to="/queue" replace />} />
            <Route path="queue" element={<QueuePage />} />
            <Route path="customers/:id" element={<CustomerProfilePage />} />
            <Route
              path="admin"
              element={
                <Protected adminOnly>
                  <AdminDashboardPage />
                </Protected>
              }
            />
            <Route
              path="admin/insights"
              element={
                <Protected adminOnly>
                  <AdminInsightsPage />
                </Protected>
              }
            />
            <Route
              path="admin/customers"
              element={
                <Protected adminOnly>
                  <AdminCustomersPage />
                </Protected>
              }
            />
            <Route
              path="admin/agents"
              element={
                <Protected adminOnly>
                  <AdminAgentsPage />
                </Protected>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
