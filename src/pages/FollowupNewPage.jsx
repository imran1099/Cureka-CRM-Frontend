import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { ChevronLeft, Save } from "lucide-react";

export default function FollowupNewPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [form, setForm] = useState({
    customer_id: "",
    title: "",
    category_id: "",
    priority: "medium",
    due_at: "",
    description: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [customersRes, categoriesRes] = await Promise.all([
          api.listCustomers({ limit: 100 }), // Fetching top 100 customers for simple dropdown
          api.followups.getCategories(),
        ]);
        setCustomers(customersRes.customers || []);
        setCategories(categoriesRes.categories || []);
      } catch (e) {
        console.error("Error fetching dependencies:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customer_id || !form.title || !form.due_at || !form.category_id) {
      alert("Please fill in all required fields (Customer, Title, Category, Due Date).");
      return;
    }

    setSubmitting(true);
    try {
      await api.followups.create(form);
      navigate("/followups");
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to create follow-up");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: "center", color: "#64748B" }}>Loading form data...</div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", padding: "24px 32px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B", display: "flex", alignItems: "center" }}
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0F172A" }}>Create Follow-up</h1>
          <p style={{ margin: 0, fontSize: 13, color: "#64748B", marginTop: 2 }}>Schedule a new manual follow-up task</p>
        </div>
      </div>

      <div style={{ maxWidth: 600, background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #E2E8F0" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          
          <div>
            <label style={labelStyle}>Customer <span style={{ color: "#DC2626" }}>*</span></label>
            <select 
              value={form.customer_id} 
              onChange={e => setForm(f => ({ ...f, customer_id: e.target.value }))}
              style={inputStyle}
            >
              <option value="">Select a customer...</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.phone || c.email})</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Follow-up Title <span style={{ color: "#DC2626" }}>*</span></label>
            <input 
              type="text" 
              value={form.title} 
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Call regarding delayed shipment"
              style={inputStyle}
            />
          </div>

          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Category <span style={{ color: "#DC2626" }}>*</span></label>
              <select 
                value={form.category_id} 
                onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                style={inputStyle}
              >
                <option value="">Select category...</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
            
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Priority <span style={{ color: "#DC2626" }}>*</span></label>
              <select 
                value={form.priority} 
                onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                style={inputStyle}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Due Date & Time <span style={{ color: "#DC2626" }}>*</span></label>
            <input 
              type="datetime-local" 
              value={form.due_at} 
              onChange={e => setForm(f => ({ ...f, due_at: e.target.value }))}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Description / Notes</label>
            <textarea 
              value={form.description} 
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Any additional context for this follow-up..."
              rows={4}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 8 }}>
            <button 
              type="button" 
              onClick={() => navigate(-1)} 
              style={{ padding: "10px 16px", background: "#F1F5F9", color: "#374151", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={submitting}
              style={{ padding: "10px 20px", background: "linear-gradient(135deg, #6D28D9, #2563EB)", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
            >
              {submitting ? "Saving..." : <><Save size={16} /> Save Follow-up</>}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

const labelStyle = { display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 };
const inputStyle = { width: "100%", padding: "10px 12px", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" };
