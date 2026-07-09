import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { SEGMENTS, SOURCES } from "../lib/constants";
import { Search, Plus, Upload, ExternalLink, X, ChevronLeft, ChevronRight } from "lucide-react";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [query, setQuery] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [total, setTotal] = useState(0);

  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (query) params.q = query;
      if (segmentFilter !== "all") params.segment = segmentFilter;
      const [custRes, agentRes] = await Promise.all([api.listCustomers(params), api.iam.listUsers({ limit: 1000 })]);
      setCustomers(custRes.customers || []);
      setTotal(custRes.total || 0);
      console.log("Agents", agentRes);
      setAgents(agentRes.users || []);
    } finally {
      setLoading(false);
    }
  }, [query, segmentFilter, page, limit]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [query, segmentFilter, limit]);

  const reassign = async (customerId, agentId) => {
    await api.updateCustomer(customerId, { assigned_agent_id: agentId || null });
    load();
  };

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1080 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <h1 style={{ fontSize: 21, fontWeight: 800, margin: 0 }}>All customers</h1>
          <p style={{ fontSize: 13.5, color: "var(--muted)", margin: "4px 0 0" }}>{total} total customers</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setShowImport(true)} style={btnSecondary}>
            <Upload size={14} /> Bulk import CSV
          </button>
          <button onClick={() => setShowAdd(true)} style={btnPrimary}>
            <Plus size={14} /> Add customer
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <Search size={14} style={{ position: "absolute", left: 11, top: 11, color: "var(--muted)" }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or phone…"
            style={{ width: "100%", fontSize: 13.5, padding: "9px 11px 9px 32px", borderRadius: 9, border: "1px solid var(--slate-border)" }}
          />
        </div>
        <select value={segmentFilter} onChange={(e) => setSegmentFilter(e.target.value)} style={{ fontSize: 13, padding: "9px 11px", borderRadius: 9, border: "1px solid var(--slate-border)" }}>
          <option value="all">All segments</option>
          {Object.entries(SEGMENTS).map(([k, s]) => (
            <option key={k} value={k}>{s.label}</option>
          ))}
        </select>
      </div>

      <div style={{ background: "#fff", border: "1px solid var(--card-border)", borderRadius: 14, overflow: "hidden", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
          <thead>
            <tr style={{ background: "var(--bg)", borderBottom: "1px solid var(--card-border)" }}>
              <Th>Name</Th>
              <Th>Phone</Th>
              <Th>Segment</Th>
              <Th>Source</Th>
              <Th>Order ID(s)</Th>
              <Th align="right">LTV</Th>
              <Th>Assigned agent</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: 20, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Loading…</td></tr>
            ) : customers.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 20, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>No customers match.</td></tr>
            ) : (
              customers.map((c) => {
                const seg = SEGMENTS[c.segment] || SEGMENTS.new_lead;
                return (
                  <tr key={c.id} style={{ borderBottom: "1px solid var(--bg)" }}>
                    <td style={{ padding: "10px 16px", fontSize: 13.5, fontWeight: 600 }}>{c.name}</td>
                    <td className="tabular" style={{ padding: "10px 16px", fontSize: 13 }}>{c.phone}</td>
                    <td style={{ padding: "10px 16px" }}>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: seg.color, background: seg.bg, borderRadius: 6, padding: "3px 8px" }}>{seg.label}</span>
                    </td>
                    <td style={{ padding: "10px 16px", fontSize: 12.5, color: "var(--muted)" }}>{SOURCES[c.source] || c.source}</td>
                    <td style={{ padding: "10px 16px" }}>
                      {c.order_ids ? c.order_ids.split(",").map(oid => (
                        <span key={oid.trim()} style={{ fontSize: 11, fontWeight: 600, background: "var(--slate-light)", color: "var(--slate)", borderRadius: 4, padding: "2px 6px", marginRight: 4, display: "inline-block", marginBottom: 2 }}>
                          {oid.trim()}
                        </span>
                      )) : <span style={{ color: "var(--muted)", fontSize: 12 }}>—</span>}
                    </td>
                    <td className="tabular" style={{ padding: "10px 16px", fontSize: 13, textAlign: "right" }}>₹{Number(c.ltv).toLocaleString("en-IN")}</td>
                    <td style={{ padding: "10px 16px" }}>
                      <select
                        value={c.assigned_agent_id || ""}
                        onChange={(e) => reassign(c.id, e.target.value)}
                        style={{ fontSize: 12.5, padding: "5px 8px", borderRadius: 7, border: "1px solid var(--slate-border)" }}
                      >
                        <option value="">Unassigned</option>
                        {agents.filter((a) => a.role_slug !== "admin" && a.role_slug !== "super_admin").map((a) => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: "10px 16px" }}>
                      <button onClick={() => navigate(`/customers/${c.id}`)} style={{ background: "none", border: "none", color: "var(--teal)" }}>
                        <ExternalLink size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, padding: "8px 0" }}>
        <div style={{ fontSize: 13, color: "var(--muted)" }}>
          Showing {total === 0 ? 0 : (page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} customers
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
            <span>Rows per page:</span>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid var(--slate-border)", fontSize: 13 }}
            >
              {[10, 25, 50, 100].map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{ ...pageBtn, opacity: page === 1 ? 0.5 : 1 }}
            >
              <ChevronLeft size={16} />
            </button>
            <div style={{ display: "flex", alignItems: "center", padding: "0 12px", fontSize: 13, fontWeight: 600 }}>
              Page {page}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(Math.ceil(total / limit), p + 1))}
              disabled={page >= Math.ceil(total / limit) || total === 0}
              style={{ ...pageBtn, opacity: page >= Math.ceil(total / limit) || total === 0 ? 0.5 : 1 }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {showAdd && <AddCustomerModal agents={agents} onClose={() => setShowAdd(false)} onDone={() => { setShowAdd(false); load(); }} />}
      {showImport && <ImportModal onClose={() => setShowImport(false)} onDone={() => { setShowImport(false); load(); }} />}
    </div>
  );
}

function Th({ children, align = "left" }) {
  return <th style={{ padding: "10px 16px", fontSize: 11.5, fontWeight: 700, color: "var(--muted)", textAlign: align, textTransform: "uppercase", letterSpacing: "0.03em" }}>{children}</th>;
}

const btnPrimary = { display: "flex", alignItems: "center", gap: 6, background: "var(--teal)", color: "#fff", border: "none", borderRadius: 9, padding: "9px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" };
const btnSecondary = { display: "flex", alignItems: "center", gap: 6, background: "#fff", color: "var(--teal)", border: "1px solid var(--teal-border)", borderRadius: 9, padding: "9px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" };
const pageBtn = { display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", border: "1px solid var(--slate-border)", borderRadius: 6, width: 32, height: 32, cursor: "pointer", color: "var(--slate)" };

function AddCustomerModal({ agents, onClose, onDone }) {
  const [form, setForm] = useState({ name: "", phone: "", segment: "new_lead", source: "manual_upload", ltv: "", assigned_agent_id: "", product_name: "", sku: "", order_ids: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setSaving(true);
    setError("");
    try {
      await api.createCustomer({ ...form, ltv: Number(form.ltv) || 0, assigned_agent_id: form.assigned_agent_id || null });
      onDone();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title="Add customer" onClose={onClose}>
      <Field label="Name"><input style={inputStyle} value={form.name} onChange={(e) => set("name", e.target.value)} /></Field>
      <Field label="Phone"><input style={inputStyle} value={form.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
      <Field label="Segment">
        <select style={inputStyle} value={form.segment} onChange={(e) => set("segment", e.target.value)}>
          {Object.entries(SEGMENTS).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
        </select>
      </Field>
      <Field label="Source">
        <select style={inputStyle} value={form.source} onChange={(e) => set("source", e.target.value)}>
          {Object.entries(SOURCES).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
        </select>
      </Field>
      <Field label="Product Name"><input style={inputStyle} value={form.product_name} onChange={(e) => set("product_name", e.target.value)} placeholder="e.g. Cureka Daily Vitamins" /></Field>
      <Field label="SKU"><input style={inputStyle} value={form.sku} onChange={(e) => set("sku", e.target.value)} placeholder="e.g. CDV-1001" /></Field>
      <Field label="Order ID(s) (comma-separated)"><input style={inputStyle} value={form.order_ids} onChange={(e) => set("order_ids", e.target.value)} placeholder="e.g. ORD-01, ORD-02" /></Field>
      <Field label="Lifetime value (₹)"><input type="number" style={inputStyle} value={form.ltv} onChange={(e) => set("ltv", e.target.value)} /></Field>
      <Field label="Assign to agent">
        <select style={inputStyle} value={form.assigned_agent_id} onChange={(e) => set("assigned_agent_id", e.target.value)}>
          <option value="">Unassigned </option>
          {agents.filter((a) => a.role_slug !== "admin" && a.role_slug !== "super_admin").map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </Field>
      {error && <div style={{ color: "var(--coral)", fontSize: 12.5, marginBottom: 10 }}>{error}</div>}
      <button onClick={submit} disabled={!form.name || !form.phone || saving} style={{ ...btnPrimary, width: "100%", justifyContent: "center", opacity: !form.name || !form.phone ? 0.5 : 1 }}>
        {saving ? "Adding…" : "Add customer"}
      </button>
    </ModalShell>
  );
}

function ImportModal({ onClose, onDone }) {
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [importing, setImporting] = useState(false);
  const fileRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setError("");
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target.result;
        const parsed = parseCsv(text);
        setRows(parsed);
      } catch (err) {
        setError("Could not parse CSV: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const submit = async () => {
    if (rows.length === 0) return;
    setImporting(true);
    setError("");
    try {
      const res = await api.bulkImport(rows);
      onDone();
    } catch (e) {
      setError(e.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <ModalShell title="Bulk import customers (CSV)" onClose={onClose} wide>
      <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: -6, marginBottom: 14 }}>
        Expected columns: <code>name, phone, email, age, gender, city, segment, source, ltv, last_order_date, replenish_due_date, cart_value, cart_items, cart_abandoned_at, health_conditions, product_preferences, allergies_restrictions, preferred_contact_time, preferred_language, household_notes, price_sensitivity, product_name, sku, order_ids</code>.
        Only <strong>name</strong> and <strong>phone</strong> are required — leave others blank if not applicable. For <code>health_conditions</code>/<code>product_preferences</code>, separate multiple values with a semicolon or comma in the same cell (e.g. "diabetes; joint pain").
      </p>

      <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} style={{ marginBottom: 12 }} />

      {rows.length > 0 && (
        <div style={{ fontSize: 12.5, color: "var(--teal)", background: "var(--teal-light)", borderRadius: 8, padding: "8px 12px", marginBottom: 12 }}>
          {fileName}: {rows.length} rows ready to import.
        </div>
      )}

      {error && <div style={{ color: "var(--coral)", fontSize: 12.5, marginBottom: 10 }}>{error}</div>}

      <button onClick={submit} disabled={rows.length === 0 || importing} style={{ ...btnPrimary, width: "100%", justifyContent: "center", opacity: rows.length === 0 ? 0.5 : 1 }}>
        {importing ? "Importing…" : `Import ${rows.length || ""} customers`}
      </button>
    </ModalShell>
  );
}

// Minimal, dependency-free CSV parser (handles quoted fields with commas)
function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) throw new Error("File needs a header row plus at least one data row");
  const headers = splitCsvLine(lines[0]).map((h) => h.trim());
  return lines.slice(1).filter(Boolean).map((line) => {
    const values = splitCsvLine(line);
    const row = {};
    headers.forEach((h, i) => (row[h] = values[i] !== undefined ? values[i].trim() : ""));
    return row;
  });
}

function splitCsvLine(line) {
  const result = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result;
}

function ModalShell({ title, onClose, children, wide }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,30,28,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, padding: 22, width: "100%", maxWidth: wide ? 520 : 420, maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 16.5, fontWeight: 700 }}>{title}</h2>
          <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--muted)" }}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--slate)", marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = { width: "100%", fontSize: 14, padding: "9px 11px", borderRadius: 9, border: "1px solid var(--slate-border)", fontFamily: "inherit" };
