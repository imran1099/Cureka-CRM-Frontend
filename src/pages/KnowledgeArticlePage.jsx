import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Clock, User, CheckCircle, Tag, Shield, FileText, Share2, MessageSquare, Star } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";

const COLORS = {
  primary: "#6D28D9",
  primaryLight: "#F5F3FF",
  success: "#16A34A",
  successLight: "#F0FDF4",
  warning: "#EA580C",
  warningLight: "#FFF7ED",
  danger: "#DC2626",
  text: "#0F172A",
  textMuted: "#64748B",
  border: "#E2E8F0",
  bg: "#F8FAFC",
  card: "#FFFFFF",
};

export default function KnowledgeArticlePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.knowledge.getArticle(id);
      setArticle(res.article);
      // Auto mark as read if it is published
      if (res.article.status === 'published' && !res.article.is_read) {
        await api.knowledge.markAsRead(id);
      }
    } catch (err) {
      setError(err.message || "Failed to load article");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmitReview = async () => {
    if (!window.confirm("Submit this draft for review?")) return;
    setActionLoading(true);
    try {
      await api.knowledge.submitForReview(id);
      alert("Submitted for review!");
      loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!window.confirm("Publish this article? It will become visible to everyone.")) return;
    setActionLoading(true);
    try {
      await api.knowledge.publishArticle(id);
      alert("Article published successfully!");
      loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: COLORS.textMuted }}>Loading article...</div>;
  if (error || !article) return <div style={{ padding: 40, textAlign: "center", color: COLORS.danger }}>{error || "Article not found"}</div>;

  const btnStyle = { padding: "8px 16px", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", border: "none" };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: COLORS.bg, overflow: "hidden" }}>
      
      {/* Header */}
      <div style={{ background: COLORS.card, borderBottom: `1px solid ${COLORS.border}`, padding: "16px 32px", flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={() => navigate(-1)} style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: COLORS.textMuted }}>
            <ArrowLeft size={16} />
          </button>
          
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ background: COLORS.primaryLight, color: COLORS.primary, padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 800, textTransform: "uppercase" }}>
              {article.category_name || "Uncategorized"}
            </div>
            
            {article.status === 'draft' && <span style={{ background: COLORS.bg, color: COLORS.textMuted, padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 800, textTransform: "uppercase" }}>Draft</span>}
            {article.status === 'pending_review' && <span style={{ background: COLORS.warningLight, color: COLORS.warning, padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 800, textTransform: "uppercase" }}>Pending Review</span>}
            {article.status === 'published' && <span style={{ background: COLORS.successLight, color: COLORS.success, padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 800, textTransform: "uppercase" }}>Published v{article.version_num}</span>}
          </div>
        </div>

        {/* Workflow Actions */}
        <div style={{ display: "flex", gap: 12 }}>
          {article.status === 'draft' && (article.author_id === user.id || hasPermission("settings", "modify")) && (
            <button onClick={handleSubmitReview} disabled={actionLoading} style={{ ...btnStyle, background: "linear-gradient(135deg, #6D28D9, #4F46E5)", color: "#fff" }}>
              Submit for Review
            </button>
          )}
          
          {article.status === 'pending_review' && hasPermission("settings", "modify") && (
            <button onClick={handlePublish} disabled={actionLoading} style={{ ...btnStyle, background: COLORS.success, color: "#fff" }}>
              Approve & Publish
            </button>
          )}
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        
        {/* Main Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "40px" }}>
          <div style={{ maxWidth: 850, margin: "0 auto", background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "40px 48px", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
            
            <h1 style={{ margin: "0 0 16px 0", fontSize: 28, fontWeight: 800, color: COLORS.text, lineHeight: 1.3 }}>
              {article.title}
            </h1>
            
            <p style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.6, margin: "0 0 24px 0" }}>
              {article.summary}
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: 20, borderTop: `1px solid ${COLORS.border}`, borderBottom: `1px solid ${COLORS.border}`, padding: "16px 0", marginBottom: 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: COLORS.textMuted }}>
                <User size={16} /> <strong>Author:</strong> {article.author_name}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: COLORS.textMuted }}>
                <Clock size={16} /> <strong>Updated:</strong> {new Date(article.updated_at).toLocaleDateString()}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: COLORS.textMuted }}>
                <BookOpen size={16} /> <strong>Views:</strong> {article.views}
              </div>
            </div>

            {/* Article Body - Rendered as HTML */}
            <div 
              className="knowledge-content"
              style={{ fontSize: 15, lineHeight: 1.7, color: COLORS.text }}
              dangerouslySetInnerHTML={{ __html: article.content }} 
            />

            <div style={{ marginTop: 48, paddingTop: 24, borderTop: `1px solid ${COLORS.border}` }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 12px 0", color: COLORS.textMuted }}>Tags</h4>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {article.tags?.length > 0 ? article.tags.map(tag => (
                  <span key={tag} style={{ padding: "4px 10px", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 12, fontSize: 12, color: COLORS.textMuted, display: "flex", alignItems: "center", gap: 4 }}>
                    <Tag size={12} /> {tag}
                  </span>
                )) : <span style={{ fontSize: 12, color: COLORS.textMuted }}>No tags</span>}
              </div>
            </div>

          </div>
        </div>

        {/* Right Sidebar - Info & LMS */}
        <div style={{ width: 300, background: COLORS.card, borderLeft: `1px solid ${COLORS.border}`, overflowY: "auto", padding: 24 }}>
          
          <h3 style={{ fontSize: 14, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: COLORS.text, marginBottom: 16 }}>Learning Progress</h3>
          
          {article.is_read ? (
            <div style={{ background: COLORS.successLight, border: `1px solid ${COLORS.success}44`, padding: 16, borderRadius: 10, display: "flex", alignItems: "center", gap: 12, color: COLORS.success, marginBottom: 32 }}>
              <CheckCircle size={24} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>Completed</div>
                <div style={{ fontSize: 11 }}>You have read this module.</div>
              </div>
            </div>
          ) : (
            <div style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, padding: 16, borderRadius: 10, display: "flex", alignItems: "center", gap: 12, color: COLORS.textMuted, marginBottom: 32 }}>
              <Clock size={24} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>In Progress</div>
                <div style={{ fontSize: 11 }}>Reading time being tracked.</div>
              </div>
            </div>
          )}

          <h3 style={{ fontSize: 14, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: COLORS.text, marginBottom: 16 }}>Document Details</h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13, color: COLORS.textMuted, marginBottom: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>Knowledge ID</strong>
              <span>{article.id}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>Version</strong>
              <span>v{article.version_num}</span>
            </div>
            {article.department && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>Department</strong>
                <span>{article.department}</span>
              </div>
            )}
            {article.reviewer_name && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>Approved By</strong>
                <span>{article.reviewer_name}</span>
              </div>
            )}
            {article.effective_date && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>Effective Date</strong>
                <span>{new Date(article.effective_date).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          <h3 style={{ fontSize: 14, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: COLORS.text, marginBottom: 16 }}>Feedback</h3>
          <div style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, padding: 16, borderRadius: 10, textAlign: "center" }}>
            <p style={{ margin: "0 0 12px 0", fontSize: 13, color: COLORS.textMuted, fontWeight: 600 }}>Was this article helpful?</p>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ flex: 1, padding: "8px", background: "#fff", border: `1px solid ${COLORS.border}`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer", fontWeight: 700, color: COLORS.success }}><CheckCircle size={14} /> Yes</button>
              <button style={{ flex: 1, padding: "8px", background: "#fff", border: `1px solid ${COLORS.border}`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer", fontWeight: 700, color: COLORS.danger }}><AlertTriangle size={14} /> No</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
