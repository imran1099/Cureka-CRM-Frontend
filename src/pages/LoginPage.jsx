import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";
import { PhoneCall } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const user = await login(email, password);
      navigate(user.role === "admin" ? "/admin" : "/queue");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--teal)",
        padding: 20,
      }}
    >
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, color: "#fff" }}>
          <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: 9, display: "flex" }}>
            <PhoneCall size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-0.01em" }}>Cureka CRM</div>
            <div style={{ fontSize: 12.5, opacity: 0.75 }}>Customer support call console</div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ background: "#fff", borderRadius: 18, padding: 28, boxShadow: "0 20px 50px rgba(0,0,0,0.18)" }}
        >
          <h1 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px" }}>Sign in</h1>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 20px" }}>Use your agent or admin credentials.</p>

          <label style={labelStyle}>Email</label>
          <input
            style={inputStyle}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="agent1@cureka.com"
            autoFocus
            required
          />

          <label style={{ ...labelStyle, marginTop: 14 }}>Password</label>
          <input
            style={inputStyle}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          {error && (
            <div style={{ marginTop: 12, fontSize: 13, color: "var(--coral)", background: "var(--coral-light)", borderRadius: 8, padding: "8px 10px" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            style={{
              width: "100%",
              marginTop: 18,
              background: "var(--teal)",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "12px",
              fontSize: 14,
              fontWeight: 700,
              opacity: busy ? 0.7 : 1,
            }}
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 16 }}>
          Run <code style={{ background: "rgba(255,255,255,0.15)", padding: "2px 6px", borderRadius: 4 }}>npm run seed</code> in /server to create demo logins.
        </p>
      </div>
    </div>
  );
}

const labelStyle = { display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--slate)", marginBottom: 6 };
const inputStyle = {
  width: "100%",
  fontSize: 14,
  padding: "10px 12px",
  borderRadius: 9,
  border: "1px solid var(--slate-border)",
  background: "#fff",
};
