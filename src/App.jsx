import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/auth.jsx";
import { BrandProvider } from "./lib/BrandContext.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import QueuePage from "./pages/QueuePage.jsx";
import CustomerProfilePage from "./pages/CustomerProfilePage.jsx";
import TicketsListPage from "./pages/TicketsListPage.jsx";
import TicketWorkspacePage from "./pages/TicketWorkspacePage.jsx";
import CallQueuePage from "./pages/CallQueuePage.jsx";
import CallWorkspacePage from "./pages/CallWorkspacePage.jsx";
import CallAnalyticsDashboard from "./pages/CallAnalyticsDashboard.jsx";
import AdminDashboardPage from "./pages/AdminDashboardPage.jsx";
import AdminInsightsPage from "./pages/AdminInsightsPage.jsx";
import AdminCustomersPage from "./pages/AdminCustomersPage.jsx";
import AdminAgentsPage from "./pages/AdminAgentsPage.jsx";
import AdminRolesPage from "./pages/AdminRolesPage.jsx";
import BrandManagementPage from "./pages/BrandManagementPage.jsx";
import AdminTicketsConfigPage from "./pages/AdminTicketsConfigPage.jsx";
import CommandCenterPage from "./pages/CommandCenterPage.jsx";
import CommandCenterAnalytics from "./pages/CommandCenterAnalytics.jsx";
import PipelinePage from "./pages/PipelinePage.jsx";
import OpportunityWorkspacePage from "./pages/OpportunityWorkspacePage.jsx";
import CREDashboard from "./pages/CREDashboard.jsx";
import CustomerJourneyPage from "./pages/CustomerJourneyPage.jsx";
import FollowupDashboardPage from "./pages/FollowupDashboardPage.jsx";
import FollowupNewPage from "./pages/FollowupNewPage.jsx";
import FollowupAnalyticsPage from "./pages/FollowupAnalyticsPage.jsx";
import WorkflowRulesPage from "./pages/WorkflowRulesPage.jsx";
import ShopifyIntegrationPage from "./pages/ShopifyIntegrationPage.jsx";
import KnowledgeHubPage from "./pages/KnowledgeHubPage.jsx";
import KnowledgeEditorPage from "./pages/KnowledgeEditorPage.jsx";
import KnowledgeArticlePage from "./pages/KnowledgeArticlePage.jsx";
import BIDashboardPage from "./pages/BIDashboardPage.jsx";
import RADIPHubPage from "./pages/RADIPHubPage.jsx";
import RADIPViewerPage from "./pages/RADIPViewerPage.jsx";
import RADIPBuilderPage from "./pages/RADIPBuilderPage.jsx";
import PIKFScorecardPage from "./pages/PIKFScorecardPage.jsx";
import PIKFLeaderboardPage from "./pages/PIKFLeaderboardPage.jsx";
import PIKFManagerPage from "./pages/PIKFManagerPage.jsx";
import BAWOEHubPage from "./pages/BAWOEHubPage.jsx";
import BAWOEBuilderPage from "./pages/BAWOEBuilderPage.jsx";
import BAWOELogViewerPage from "./pages/BAWOELogViewerPage.jsx";
import UNCCCenterPage from "./pages/UNCCCenterPage.jsx";
import ESCAMSConsolePage from "./pages/ESCAMSConsolePage.jsx";
import AppShell from "./components/AppShell.jsx";

function Protected({ children, module, action }) {
  const { user, loading, hasPermission } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace />;
  
  if (module && action) {
    if (!hasPermission(module, action)) {
      return <Navigate to="/queue" replace />;
    }
  }
  
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
      <BrandProvider>
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
                path="tickets"
                element={
                  <Protected module="tickets" action="view">
                    <TicketsListPage />
                  </Protected>
                }
              />
              <Route
                path="tickets/:id"
                element={
                  <Protected module="tickets" action="view">
                    <TicketWorkspacePage />
                  </Protected>
                }
              />
              <Route
                path="calls"
                element={
                  <Protected module="calls" action="view">
                    <CallQueuePage />
                  </Protected>
                }
              />
              <Route
                path="calls/workspace/:customerId"
                element={
                  <Protected module="calls" action="make">
                    <CallWorkspacePage />
                  </Protected>
                }
              />
              <Route
                path="calls/analytics"
                element={
                  <Protected module="reports" action="view">
                    <CallAnalyticsDashboard />
                  </Protected>
                }
              />
              <Route
                path="command-center"
                element={
                  <Protected module="calls" action="view">
                    <CommandCenterPage />
                  </Protected>
                }
              />
              <Route
                path="command-center/analytics"
                element={
                  <Protected module="reports" action="view">
                    <CommandCenterAnalytics />
                  </Protected>
                }
              />
              <Route
                path="pipeline"
                element={
                  <Protected module="calls" action="view">
                    <PipelinePage />
                  </Protected>
                }
              />
              <Route
                path="pipeline/analytics"
                element={
                  <Protected module="reports" action="view">
                    <CREDashboard />
                  </Protected>
                }
              />
              <Route
                path="notifications"
                element={
                  <UNCCCenterPage />
                }
              />
              <Route
                path="bi-dashboard"
                element={
                  <Protected module="reports" action="view">
                    <BIDashboardPage />
                  </Protected>
                }
              />
              <Route
                path="radip"
                element={
                  <Protected module="reports" action="view">
                    <RADIPHubPage />
                  </Protected>
                }
              />
              <Route
                path="radip/viewer/:id"
                element={
                  <Protected module="reports" action="view">
                    <RADIPViewerPage />
                  </Protected>
                }
              />
              <Route
                path="radip/builder"
                element={
                  <Protected module="reports" action="modify">
                    <RADIPBuilderPage />
                  </Protected>
                }
              />
              <Route
                path="pikf/scorecard"
                element={
                  <Protected module="reports" action="view">
                    <PIKFScorecardPage />
                  </Protected>
                }
              />
              <Route
                path="pikf/leaderboard"
                element={
                  <Protected module="reports" action="view">
                    <PIKFLeaderboardPage />
                  </Protected>
                }
              />
              <Route
                path="pikf/manager"
                element={
                  <Protected module="reports" action="modify">
                    <PIKFManagerPage />
                  </Protected>
                }
              />
              <Route
                path="automation"
                element={
                  <Protected module="admin" action="view">
                    <BAWOEHubPage />
                  </Protected>
                }
              />
              <Route
                path="automation/builder/:id"
                element={
                  <Protected module="admin" action="modify">
                    <BAWOEBuilderPage />
                  </Protected>
                }
              />
              <Route
                path="automation/logs/:id"
                element={
                  <Protected module="admin" action="view">
                    <BAWOELogViewerPage />
                  </Protected>
                }
              />
              <Route
                path="pipeline/:id"
                element={
                  <Protected module="calls" action="view">
                    <OpportunityWorkspacePage />
                  </Protected>
                }
              />
              <Route
                path="journey/:id"
                element={
                  <Protected module="customers" action="view">
                    <CustomerJourneyPage />
                  </Protected>
                }
              />
              <Route
                path="followups"
                element={
                  <Protected>
                    <FollowupDashboardPage />
                  </Protected>
                }
              />
              <Route
                path="followups/new"
                element={
                  <Protected>
                    <FollowupNewPage />
                  </Protected>
                }
              />
              <Route
                path="followups/analytics"
                element={
                  <Protected module="reports" action="view">
                    <FollowupAnalyticsPage />
                  </Protected>
                }
              />
              <Route
                path="followups/rules"
                element={
                  <Protected module="settings" action="modify">
                    <WorkflowRulesPage />
                  </Protected>
                }
              />
              <Route
                path="knowledge"
                element={
                  <Protected module="knowledge" action="view">
                    <KnowledgeHubPage />
                  </Protected>
                }
              />
              <Route
                path="knowledge/editor"
                element={
                  <Protected module="knowledge" action="modify">
                    <KnowledgeEditorPage />
                  </Protected>
                }
              />
              <Route
                path="knowledge/article/:id"
                element={
                  <Protected module="knowledge" action="view">
                    <KnowledgeArticlePage />
                  </Protected>
                }
              />
              <Route
                path="admin"
                element={
                  <Protected module="reports" action="view">
                    <AdminDashboardPage />
                  </Protected>
                }
              />
              <Route
                path="admin/tickets-config"
                element={
                  <Protected module="settings" action="modify">
                    <AdminTicketsConfigPage />
                  </Protected>
                }
              />
              <Route
                path="admin/insights"
                element={
                  <Protected module="reports" action="view">
                    <AdminInsightsPage />
                  </Protected>
                }
              />
              <Route
                path="admin/customers"
                element={
                  <Protected module="customers" action="view">
                    <AdminCustomersPage />
                  </Protected>
                }
              />
              <Route
                path="admin/agents"
                element={
                  <Protected module="users" action="view">
                    <AdminAgentsPage />
                  </Protected>
                }
              />
              <Route
                path="admin/roles"
                element={
                  <Protected module="roles" action="view">
                    <AdminRolesPage />
                  </Protected>
                }
              />
              <Route
                path="admin/brands"
                element={
                  <Protected module="settings" action="modify">
                    <BrandManagementPage />
                  </Protected>
                }
              />
              <Route
                path="admin/security"
                element={
                  <Protected module="settings" action="modify">
                    <ESCAMSConsolePage />
                  </Protected>
                }
              />
              <Route
                path="admin/integrations/shopify"
                element={
                  <Protected module="settings" action="modify">
                    <ShopifyIntegrationPage />
                  </Protected>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </BrandProvider>
    </AuthProvider>
  );
}
