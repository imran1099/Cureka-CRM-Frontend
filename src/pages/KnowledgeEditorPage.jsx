import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Send, PenTool, CheckCircle, AlertTriangle } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";

const COLORS = {
  primary: "#6D28D9",
  primaryLight: "#F5F3FF",
  text: "#0F172A",
  textMuted: "#64748B",
  border: "#E2E8F0",
  bg: "#F8FAFC",
  card: "#FFFFFF",
};

export default function KnowledgeEditorPage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    content: "",
    category_id: "",
    brand_id: "",
    department: "",
    tags: ""
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadLookups();
  }, []);

  const loadLookups = async () => {
    try {
      const [catRes, brRes] = await Promise.all([
        api.knowledge.getCategories(),
        api.getBrands ? api.getBrands() : { brands: [] }
      ]);
      setCategories(catRes.categories || []);
      setBrands(brRes.brands || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.category_id || !formData.content) {
      return alert("Title, Category, and Content are required.");
    }
    
    setSaving(true);
    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean)
      };
      
      const res = await api.knowledge.createArticle(payload);
      alert("Draft saved successfully!");
      navigate(`/knowledge/article/${res.id}`);
    } catch (err) {
      alert("Error saving draft: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px", border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 14, outline: "none", marginTop: 6,
  };
  const labelStyle = { fontSize: 13, fontWeight: 700, color: COLORS.textMuted, display: "block", marginTop: 20 };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: COLORS.bg, overflow: "hidden" }}>
      
      {/* Header */}
      <div style={{ background: COLORS.card, borderBottom: `1px solid ${COLORS.border}`, padding: "16px 32px", flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={() => navigate(-1)} style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: COLORS.textMuted }}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: COLORS.text }}>Author Knowledge Article</h1>
            <p style={{ margin: "2px 0 0 0", fontSize: 13, color: COLORS.textMuted }}>Create SOPs, scripts, or policies.</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={handleSave} disabled={saving} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "linear-gradient(135deg, #6D28D9, #4F46E5)", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
            <Save size={14} /> {saving ? "Saving..." : "Save Draft"}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "32px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 32 }}>
          
          <div style={{ background: COLORS.primaryLight, color: COLORS.primary, padding: 16, borderRadius: 8, fontSize: 13, display: "flex", gap: 10, marginBottom: 24, border: `1px solid ${COLORS.primary}44` }}>
            <PenTool size={18} />
            <div>
              <strong>Draft Mode:</strong> This article will be saved as a draft. It must be submitted for review and approved by a Manager before it becomes visible in the Knowledge Hub.
            </div>
          </div>

          <label style={{ ...labelStyle, marginTop: 0 }}>Article Title <span style={{ color: "red" }}>*</span></label>
          <input 
            type="text" 
            placeholder="e.g., Go2Sleep Gummies Product Overview" 
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
            style={{ ...inputStyle, fontSize: 18, fontWeight: 700, padding: "12px 16px" }}
          />

          <label style={labelStyle}>Summary (Optional but recommended)</label>
          <textarea 
            placeholder="A brief 1-2 sentence description..." 
            value={formData.summary}
            onChange={e => setFormData({...formData, summary: e.target.value})}
            style={{ ...inputStyle, minHeight: 60, resize: "vertical" }}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <label style={labelStyle}>Category <span style={{ color: "red" }}>*</span></label>
              <select value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} style={inputStyle}>
                <option value="">Select a category...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Brand (Optional)</label>
              <select value={formData.brand_id} onChange={e => setFormData({...formData, brand_id: e.target.value})} style={inputStyle}>
                <option value="">All Brands (Global)</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <label style={labelStyle}>Department</label>
              <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} style={inputStyle}>
                <option value="">General</option>
                <option value="Customer Support">Customer Support</option>
                <option value="Sales">Sales</option>
                <option value="Operations">Operations</option>
                <option value="HR">HR / Compliance</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Tags (Comma separated)</label>
              <input 
                type="text" 
                placeholder="e.g., refund, sop, policy" 
                value={formData.tags}
                onChange={e => setFormData({...formData, tags: e.target.value})}
                style={inputStyle}
              />
            </div>
          </div>

          <label style={labelStyle}>Article Content <span style={{ color: "red" }}>*</span></label>
          <div style={{ marginTop: 6, border: `1px solid ${COLORS.border}`, borderRadius: 8, overflow: "hidden" }}>
            <div style={{ background: COLORS.bg, borderBottom: `1px solid ${COLORS.border}`, padding: "8px 12px", fontSize: 12, color: COLORS.textMuted, fontWeight: 700 }}>
              HTML Editor (Supports standard HTML markup, lists, bold, italics)
            </div>
            <textarea 
              placeholder="<h1>Main Heading</h1><p>Start writing your SOP here...</p>" 
              value={formData.content}
              onChange={e => setFormData({...formData, content: e.target.value})}
              style={{ width: "100%", minHeight: 400, border: "none", padding: 16, fontSize: 14, outline: "none", resize: "vertical", fontFamily: "monospace" }}
            />
          </div>
          
        </div>
      </div>
    </div>
  );
}
