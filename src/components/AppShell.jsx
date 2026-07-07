import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";
import { useBrand } from "../lib/BrandContext.jsx";
import { api } from "../lib/api.js";
import { PhoneCall, LayoutGrid, Users, UserCog, LogOut, ListChecks, Lightbulb, BellRing, X, Briefcase, Shield, Ticket, PhoneOutgoing, LayoutList, Kanban, BarChart3, Settings } from "lucide-react";

export default function AppShell() {
  const { user, logout, hasPermission } = useAuth();
  const { brands, selectedBrandId, setSelectedBrandId } = useBrand();
  const navigate = useNavigate();
  const [dueCallbacks, setDueCallbacks] = useState([]);

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

  const isManagement = hasPermission("reports", "view") || hasPermission("users", "view");

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top Navbar / Brand Switcher */}
      {isManagement && (
        <header style={{ height: 60, background: "#fff", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", padding: "0 24px", justifyContent: "flex-end" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--slate)" }}>Viewing Brand:</span>
            <select 
              value={selectedBrandId || ""}
              onChange={(e) => {
                setSelectedBrandId(e.target.value);
                window.location.reload(); // Quick way to refresh all data globally
              }}
              className="input"
              style={{ width: 200, padding: "6px 10px", margin: 0, height: "auto" }}
            >
              <option value="all">All Brands</option>
              {brands.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </header>
      )}

      <div style={{ flex: 1, display: "flex" }}>
        <aside
          style={{
            width: 220,
            background: "var(--teal)",
            color: "#fff",
            padding: "20px 14px",
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 6px", marginBottom: 28 }}>
            <PhoneCall size={19} />
            <span style={{ fontWeight: 800, fontSize: 15.5, letterSpacing: "-0.01em" }}>Cureka CRM</span>
          </div>

          <nav style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
            <NavItem to="/queue" icon={ListChecks} label="My call queue" />
            
            {hasPermission("calls", "view") && (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.55, letterSpacing: "0.05em", margin: "16px 10px 4px" }}>
                  TICKETS & ENGAGEMENT
                </div>
                <NavItem to="/command-center" icon={LayoutList} label="Command Center" />
                <NavItem to="/pipeline" icon={Kanban} label="Sales Pipeline" />
                <NavItem to="/tickets" icon={Ticket} label="All Tickets" />
                <NavItem to="/calls" icon={PhoneOutgoing} label="Outbound Calls" />
              </>
            )}

            {hasPermission("reports", "view") && (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.55, letterSpacing: "0.05em", margin: "16px 10px 4px" }}>
                  MANAGEMENT
                </div>
                <NavItem to="/admin" icon={LayoutGrid} label="Dashboard" />
                <NavItem to="/admin/insights" icon={Lightbulb} label="Insights" />
                <NavItem to="/command-center/analytics" icon={BarChart3} label="CSCC Analytics" />
                <NavItem to="/pipeline/analytics" icon={BarChart3} label="Revenue Analytics" />
                <NavItem to="/calls/analytics" icon={BarChart3} label="Call Analytics" />
              </>
            )}

            {hasPermission("customers", "view") && (
              <NavItem to="/admin/customers" icon={Users} label="All customers" />
            )}

            {(hasPermission("users", "view") || hasPermission("roles", "view") || hasPermission("settings", "view")) && (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.55, letterSpacing: "0.05em", margin: "16px 10px 4px" }}>
                  ADMIN
                </div>
                {hasPermission("users", "view") && <NavItem to="/admin/agents" icon={UserCog} label="Users & Agents" />}
                {hasPermission("roles", "view") && <NavItem to="/admin/roles" icon={Shield} label="Roles & Permissions" />}
                {hasPermission("settings", "modify") && (
                  <>
                    <NavItem to="/admin/brands" icon={Briefcase} label="Brands" />
                    <NavItem to="/admin/tickets-config" icon={Settings} label="Ticket Settings" />
                  </>
                )}
              </>
            )}
          </nav>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: 14, marginTop: 14 }}>
            {!isManagement && (
              <div style={{ fontSize: 11.5, opacity: 0.65, padding: "0 6px", marginBottom: 4 }}>
                Brand: {brands.find(b => b.id === selectedBrandId)?.name || "N/A"}
              </div>
            )}
            <div style={{ fontSize: 13, fontWeight: 600, padding: "0 6px" }}>{user?.name}</div>
            <div style={{ fontSize: 11.5, opacity: 0.65, padding: "0 6px", marginBottom: 10, textTransform: "capitalize" }}>{user?.role.replace('_', ' ')}</div>
            <button
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                width: "100%",
                background: "rgba(255,255,255,0.1)",
                border: "none",
                color: "#fff",
                borderRadius: 8,
                padding: "9px 10px",
                fontSize: 12.5,
                fontWeight: 600,
              }}
            >
              <LogOut size={13} /> Sign out
            </button>
          </div>
        </aside>

        <main style={{ flex: 1, background: "var(--bg)", height: isManagement ? "calc(100vh - 60px)" : "100vh", overflowY: "auto", position: "relative" }}>
          <Outlet />

          {dueCallbacks.length > 0 && (
            <div style={{ position: "fixed", top: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
              {dueCallbacks.map((c) => (
                <div key={c.id} style={{ background: "#fff", border: "1px solid var(--teal-border)", borderRadius: 10, padding: "12px 16px", boxShadow: "0 4px 16px rgba(0,0,0,0.1)", display: "flex", alignItems: "flex-start", gap: 12, minWidth: 280 }}>
                  <div style={{ background: "var(--teal-light)", color: "var(--teal)", borderRadius: 8, padding: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <BellRing size={16} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)", marginBottom: 2 }}>Callback Due</div>
                    <div style={{ fontSize: 12.5, color: "var(--slate)", marginBottom: 6 }}>
                      Follow up with <strong>{c.name}</strong> now.
                    </div>
                    <Link to={`/customers/${c.id}`} style={{ fontSize: 12, fontWeight: 700, color: "var(--teal)", textDecoration: "none" }}>View profile &rarr;</Link>
                  </div>
                  <button onClick={() => setDueCallbacks(prev => prev.filter(p => p.id !== c.id))} style={{ background: "none", border: "none", color: "var(--muted)", padding: 0 }}>
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function NavItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 10px",
        borderRadius: 9,
        fontSize: 13.5,
        fontWeight: 600,
        color: "#fff",
        background: isActive ? "rgba(255,255,255,0.16)" : "transparent",
        textDecoration: "none",
      })}
    >
      <Icon size={15} />
      {label}
    </NavLink>
  );
}
