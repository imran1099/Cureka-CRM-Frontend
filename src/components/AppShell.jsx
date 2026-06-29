import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";
import { api } from "../lib/api.js";
import { PhoneCall, LayoutGrid, Users, UserCog, LogOut, ListChecks, Lightbulb, BellRing, X } from "lucide-react";

export default function AppShell() {
  const { user, logout } = useAuth();
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

  const isAdmin = user?.role === "admin";

  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
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
          {isAdmin && (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.55, letterSpacing: "0.05em", margin: "16px 10px 4px" }}>
                ADMIN
              </div>
              <NavItem to="/admin" icon={LayoutGrid} label="Dashboard" />
              <NavItem to="/admin/insights" icon={Lightbulb} label="Insights" />
              <NavItem to="/admin/customers" icon={Users} label="All customers" />
              <NavItem to="/admin/agents" icon={UserCog} label="Agents" />
            </>
          )}
        </nav>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: 14, marginTop: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, padding: "0 6px" }}>{user?.name}</div>
          <div style={{ fontSize: 11.5, opacity: 0.65, padding: "0 6px", marginBottom: 10, textTransform: "capitalize" }}>{user?.role}</div>
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

      <main style={{ flex: 1, background: "var(--bg)", minHeight: "100vh", overflowY: "auto", position: "relative" }}>
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
