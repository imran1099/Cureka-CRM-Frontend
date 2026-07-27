import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";
import { useBrand } from "../lib/BrandContext.jsx";
import { useTheme } from "../lib/ThemeContext.jsx";
import { api } from "../lib/api.js";
import NotificationBell from "./NotificationBell.jsx";
import { GlobalSearchModal } from "./GlobalSearchModal.jsx";
import { AIAssistantDrawer } from "./AIAssistantDrawer.jsx";
import {
  PhoneCall,
  LayoutGrid,
  Users,
  UserCog,
  LogOut,
  ListChecks,
  Lightbulb,
  Briefcase,
  Shield,
  Ticket,
  PhoneOutgoing,
  LayoutList,
  Kanban,
  BarChart3,
  Settings,
  Clock,
  Zap,
  ShoppingBag,
  BookOpen,
  Star,
  Trophy,
  Workflow,
  ShieldAlert,
  Search,
  Sparkles,
  Sun,
  Moon,
  Laptop,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Mail,
  RotateCcw,
  DollarSign,
  UserCheck,
} from "lucide-react";

export default function AppShell() {
  const { user, logout, hasPermission } = useAuth();
  const { brands, selectedBrandId, setSelectedBrandId } = useBrand();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [dueCallbacks, setDueCallbacks] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState({
    engagement: true,
    sales: false,
    analytics: false,
    admin: false,
  });

  useEffect(() => {
    if (!user) return;
    const checkDue = async () => {
      try {
        const res = await api.getDueCallbacks();
        setDueCallbacks(res.due || []);
      } catch (err) {}
    };
    checkDue();
    const int = setInterval(checkDue, 60000);
    return () => clearInterval(int);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleSubmenu = (key) => {
    setOpenSubmenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg)" }}>
      {/* Search & AI Drawers */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <AIAssistantDrawer isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />

      {/* FIXED LEFT SIDEBAR */}
      <aside
        style={{
          width: 240,
          background: "var(--bg-sidebar)",
          color: "var(--sidebar-text)",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          height: "100vh",
          position: "sticky",
          top: 0,
          borderRight: "1px solid rgba(255, 255, 255, 0.08)",
          zIndex: 40,
        }}
      >
        {/* Brand Logo Header */}
        <div
          style={{
            height: 60,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "0 18px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "var(--radius-sm)",
              background: "var(--amber)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PhoneCall size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.01em" }}>CXP Platform</div>
            <div style={{ fontSize: 11, color: "var(--sidebar-muted)" }}>Enterprise CX Suite</div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
          className="scrollbar-thin"
        >
          <SidebarNavItem to="/queue" icon={ListChecks} label="My Dashboard" badge={dueCallbacks.length > 0 ? dueCallbacks.length : null} />
          <SidebarNavItem to="/admin/customers" icon={Users} label="Customer 360°" />

          {/* ENGAGEMENT & OPERATIONS */}
          <SidebarCategoryHeader
            label="ENGAGEMENT"
            isOpen={openSubmenus.engagement}
            onToggle={() => toggleSubmenu("engagement")}
          />
          {openSubmenus.engagement && (
            <div style={{ display: "flex", flexDirection: "column", gap: 2, paddingLeft: 8 }}>
              <SidebarNavItem to="/tickets" icon={Ticket} label="Tickets" />
              <SidebarNavItem to="/calls" icon={PhoneOutgoing} label="Calls" />
              <SidebarNavItem to="/followups" icon={Clock} label="WhatsApp & Emails" />
              <SidebarNavItem to="/admin/integrations/shopify" icon={ShoppingBag} label="Orders & Returns" />
              <SidebarNavItem to="/knowledge" icon={BookOpen} label="Knowledge Base" />
            </div>
          )}

          {/* SALES CRM */}
          <SidebarCategoryHeader
            label="SALES CRM"
            isOpen={openSubmenus.sales}
            onToggle={() => toggleSubmenu("sales")}
          />
          {openSubmenus.sales && (
            <div style={{ display: "flex", flexDirection: "column", gap: 2, paddingLeft: 8 }}>
              <SidebarNavItem to="/pipeline" icon={Kanban} label="Sales Pipeline" />
              <SidebarNavItem to="/command-center" icon={LayoutList} label="Command Center" />
            </div>
          )}

          {/* PERFORMANCE & REPORTS */}
          {hasPermission("reports", "view") && (
            <>
              <SidebarCategoryHeader
                label="PERFORMANCE & BI"
                isOpen={openSubmenus.analytics}
                onToggle={() => toggleSubmenu("analytics")}
              />
              {openSubmenus.analytics && (
                <div style={{ display: "flex", flexDirection: "column", gap: 2, paddingLeft: 8 }}>
                  <SidebarNavItem to="/bi-dashboard" icon={LayoutGrid} label="BI Command Center" />
                  <SidebarNavItem to="/radip" icon={BarChart3} label="RADIP Analytics" />
                  <SidebarNavItem to="/pikf/scorecard" icon={Star} label="Team Performance" />
                  <SidebarNavItem to="/pikf/leaderboard" icon={Trophy} label="Leaderboards" />
                </div>
              )}
            </>
          )}

          {/* ADMIN & CONFIGURATION */}
          {(hasPermission("users", "view") || hasPermission("settings", "view")) && (
            <>
              <SidebarCategoryHeader
                label="ADMIN SETTINGS"
                isOpen={openSubmenus.admin}
                onToggle={() => toggleSubmenu("admin")}
              />
              {openSubmenus.admin && (
                <div style={{ display: "flex", flexDirection: "column", gap: 2, paddingLeft: 8 }}>
                  {hasPermission("users", "view") && <SidebarNavItem to="/admin/agents" icon={UserCog} label="Users & Agents" />}
                  {hasPermission("roles", "view") && <SidebarNavItem to="/admin/roles" icon={Shield} label="Roles & Permissions" />}
                  {hasPermission("settings", "modify") && (
                    <>
                      <SidebarNavItem to="/admin/brands" icon={Briefcase} label="Brand Manager" />
                      <SidebarNavItem to="/automation" icon={Workflow} label="BAWOE Workflows" />
                      <SidebarNavItem to="/admin/security" icon={ShieldAlert} label="ESCAMS Security" />
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </nav>

        {/* Sidebar Footer User Badge */}
        <div
          style={{
            padding: 14,
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "var(--amber)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {user?.name?.charAt(0) || "U"}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontWeight: 600, fontSize: 13, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                {user?.name || "User"}
              </div>
              <div style={{ fontSize: 11, color: "var(--sidebar-muted)", textTransform: "capitalize" }}>
                {user?.role || "Agent"}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            style={{
              background: "transparent",
              border: "none",
              color: "var(--sidebar-muted)",
              cursor: "pointer",
              padding: 4,
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* MAIN LAYOUT WRAPPER */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* FIXED TOP NAVIGATION BAR */}
        <header
          style={{
            height: 60,
            background: "var(--header-bg)",
            borderBottom: "1px solid var(--header-border)",
            display: "flex",
            alignItems: "center",
            padding: "0 24px",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 30,
          }}
        >
          {/* Global Search Button / Trigger */}
          <div
            onClick={() => setIsSearchOpen(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "var(--bg)",
              border: "1px solid var(--card-border)",
              borderRadius: "var(--radius-sm)",
              padding: "6px 14px",
              width: 320,
              cursor: "pointer",
              color: "var(--muted)",
              fontSize: 13,
            }}
          >
            <Search size={15} style={{ color: "var(--teal)" }} />
            <span style={{ flex: 1 }}>Search customers, tickets...</span>
            <kbd
              style={{
                background: "var(--card)",
                border: "1px solid var(--card-border)",
                borderRadius: 4,
                padding: "2px 5px",
                fontSize: 10,
                fontWeight: 700,
                color: "var(--muted)",
              }}
            >
              Ctrl+K
            </kbd>
          </div>

          {/* Right Header Action Items */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Brand Switcher Dropdown */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Briefcase size={15} style={{ color: "var(--muted)" }} />
              <select
                value={selectedBrandId || ""}
                onChange={(e) => {
                  setSelectedBrandId(e.target.value);
                  window.location.reload();
                }}
                className="input"
                style={{ width: 140, padding: "4px 8px", height: "auto", fontSize: 12.5 }}
              >
                <option value="all">All Brands</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* AI Assistant Copilot Trigger */}
            <button
              onClick={() => setIsAIOpen(true)}
              className="btn btn-sm"
              style={{
                background: "linear-gradient(135deg, var(--teal) 0%, #1d706c 100%)",
                color: "#ffffff",
                boxShadow: "0 2px 6px rgba(15, 76, 74, 0.25)",
              }}
            >
              <Sparkles size={14} />
              AI Copilot
            </button>

            {/* Tasks / Due Callbacks Counter */}
            {dueCallbacks.length > 0 && (
              <div
                title={`${dueCallbacks.length} callbacks pending`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "var(--status-pending-bg)",
                  color: "var(--status-pending-text)",
                  border: "1px solid var(--status-pending-border)",
                  borderRadius: "9999px",
                  padding: "4px 10px",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                <Clock size={13} />
                {dueCallbacks.length} Due
              </div>
            )}

            {/* UNCC Notification Bell Dropdown */}
            <NotificationBell />

            {/* User Profile & Theme Switcher Dropdown */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                style={{
                  background: "transparent",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  cursor: "pointer",
                  padding: 4,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "var(--teal)",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: 13,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {user?.name?.charAt(0) || "U"}
                </div>
                <ChevronDown size={14} style={{ color: "var(--muted)" }} />
              </button>

              {isUserMenuOpen && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "100%",
                    marginTop: 8,
                    width: 220,
                    background: "var(--card)",
                    border: "1px solid var(--card-border)",
                    borderRadius: "var(--radius-sm)",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                    padding: 8,
                    zIndex: 50,
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--card-border)", marginBottom: 4 }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5, color: "var(--ink)" }}>{user?.name}</div>
                    <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{user?.email}</div>
                  </div>

                  {/* Theme Selector Section */}
                  <div style={{ padding: "4px 12px", fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>
                    THEME MODE
                  </div>
                  <div style={{ display: "flex", gap: 4, padding: "0 8px 8px" }}>
                    <button
                      onClick={() => setTheme("light")}
                      style={{
                        flex: 1,
                        padding: 6,
                        borderRadius: 4,
                        border: theme === "light" ? "1px solid var(--teal)" : "1px solid var(--card-border)",
                        background: theme === "light" ? "var(--teal-light)" : "transparent",
                        color: theme === "light" ? "var(--teal)" : "var(--muted)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      title="Light Mode"
                    >
                      <Sun size={14} />
                    </button>
                    <button
                      onClick={() => setTheme("dark")}
                      style={{
                        flex: 1,
                        padding: 6,
                        borderRadius: 4,
                        border: theme === "dark" ? "1px solid var(--teal)" : "1px solid var(--card-border)",
                        background: theme === "dark" ? "var(--teal-light)" : "transparent",
                        color: theme === "dark" ? "var(--teal)" : "var(--muted)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      title="Dark Mode"
                    >
                      <Moon size={14} />
                    </button>
                    <button
                      onClick={() => setTheme("system")}
                      style={{
                        flex: 1,
                        padding: 6,
                        borderRadius: 4,
                        border: theme === "system" ? "1px solid var(--teal)" : "1px solid var(--card-border)",
                        background: theme === "system" ? "var(--teal-light)" : "transparent",
                        color: theme === "system" ? "var(--teal)" : "var(--muted)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      title="System Theme"
                    >
                      <Laptop size={14} />
                    </button>
                  </div>

                  <button
                    onClick={handleLogout}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 12px",
                      background: "transparent",
                      border: "none",
                      color: "var(--status-critical-text)",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      borderRadius: 4,
                    }}
                  >
                    <LogOut size={14} />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* MAIN ROUTE CONTENT CONTAINER */}
        <main style={{ flex: 1, padding: 24, minWidth: 0, overflowY: "auto" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SidebarCategoryHeader({ label, isOpen, onToggle }) {
  return (
    <div
      onClick={onToggle}
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: "var(--sidebar-muted)",
        letterSpacing: "0.05em",
        padding: "12px 10px 4px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      <span>{label}</span>
      {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
    </div>
  );
}

function SidebarNavItem({ to, icon: Icon, label, badge }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 12px",
        borderRadius: "var(--radius-sm)",
        fontSize: 13.5,
        fontWeight: isActive ? 700 : 500,
        color: isActive ? "#ffffff" : "var(--sidebar-text)",
        background: isActive ? "var(--sidebar-active)" : "transparent",
        textDecoration: "none",
        transition: "all 0.15s ease",
      })}
    >
      <Icon size={16} style={{ flexShrink: 0 }} />
      <span style={{ flex: 1, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{label}</span>
      {badge != null && (
        <span
          style={{
            background: "var(--coral)",
            color: "#ffffff",
            fontSize: 11,
            fontWeight: 800,
            padding: "1px 6px",
            borderRadius: 9999,
          }}
        >
          {badge}
        </span>
      )}
    </NavLink>
  );
}
