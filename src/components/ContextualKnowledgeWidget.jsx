import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sparkles, BookOpen, ChevronRight, FileText } from "lucide-react";
import { api } from "../lib/api";

export default function ContextualKnowledgeWidget({ intent, product, tag }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!intent && !product && !tag) return;
    
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const res = await api.knowledge.getRecommendations({ intent, product, tag });
        setRecommendations(res.recommendations || []);
      } catch (err) {
        console.error("Failed to load knowledge recommendations", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendations();
  }, [intent, product, tag]);

  if (!intent && !product && !tag) return null;
  if (recommendations.length === 0 && !loading) return null;

  return (
    <div style={{ background: "linear-gradient(135deg, #F5F3FF, #fff)", border: "1px solid #DDD6FE", borderRadius: 12, padding: 16, marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#6D28D9", fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
        <Sparkles size={16} /> Knowledge Suggestions
      </div>
      
      {loading ? (
        <div style={{ fontSize: 12, color: "#64748B" }}>Loading related knowledge...</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {recommendations.map(rec => (
            <Link 
              key={rec.id} 
              to={`/knowledge/article/${rec.id}`} 
              target="_blank"
              style={{ display: "flex", alignItems: "flex-start", gap: 10, background: "#fff", border: "1px solid #E2E8F0", padding: "10px 12px", borderRadius: 8, textDecoration: "none", color: "inherit", transition: "all 0.2s" }}
            >
              <div style={{ color: "#64748B", marginTop: 2 }}><FileText size={16} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", marginBottom: 2 }}>{rec.title}</div>
                <div style={{ fontSize: 11, color: "#6D28D9", fontWeight: 700 }}>{rec.category_name}</div>
              </div>
              <div style={{ color: "#CBD5E1", display: "flex", alignItems: "center", height: "100%" }}>
                <ChevronRight size={16} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
