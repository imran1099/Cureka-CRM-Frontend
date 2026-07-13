import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Search, Folder, FileText, CheckCircle, Clock, BookMarked, Shield, User, PenTool, Flame } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";

export default function KnowledgeHubPage() {
  const { hasPermission } = useAuth();
  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [catRes, artRes] = await Promise.all([
        api.knowledge.getCategories(),
        api.knowledge.getArticles({ query: search, category_id: activeCategory || "" })
      ]);
      setCategories(catRes.categories || []);
      setArticles(artRes.articles || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, activeCategory]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadData]);

  const topCategories = categories.filter(c => !c.parent_id);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#F8FAFC", overflow: "hidden" }}>
      
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #E2E8F0", padding: "24px 32px", flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0F172A", display: "flex", alignItems: "center", gap: 10 }}>
              <BookOpen size={24} color="#6D28D9" /> Enterprise Knowledge & Learning Hub
            </h1>
            <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#64748B" }}>
              Central repository for SOPs, Call Scripts, Product Guides, and Training.
            </p>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {(hasPermission("settings", "modify") || hasPermission("users", "view")) && (
              <Link to="/knowledge/editor" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "linear-gradient(135deg, #6D28D9, #4F46E5)", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
                <PenTool size={14} /> Author Article
              </Link>
            )}
          </div>
        </div>

        {/* Global Search */}
        <div style={{ position: "relative", maxWidth: 600 }}>
          <Search size={18} color="#64748B" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
          <input 
            type="text" 
            placeholder="Search for SOPs, scripts, products, or guidelines..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", padding: "14px 16px 14px 44px", borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 15, outline: "none", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}
          />
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        
        {/* Left Sidebar - Categories */}
        <div style={{ width: 280, background: "#fff", borderRight: "1px solid #E2E8F0", overflowY: "auto", padding: "20px" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: 14, fontWeight: 800, color: "#0F172A", textTransform: "uppercase", letterSpacing: "0.05em" }}>Categories</h3>
          
          <button
            onClick={() => setActiveCategory(null)}
            style={{ display: "flex", width: "100%", alignItems: "center", gap: 8, padding: "10px 12px", background: activeCategory === null ? "#F5F3FF" : "transparent", color: activeCategory === null ? "#6D28D9" : "#475569", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", textAlign: "left", marginBottom: 4 }}
          >
            <Folder size={16} /> All Knowledge
          </button>

          {topCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{ display: "flex", width: "100%", alignItems: "center", gap: 8, padding: "10px 12px", background: activeCategory === cat.id ? "#F5F3FF" : "transparent", color: activeCategory === cat.id ? "#6D28D9" : "#475569", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", textAlign: "left", marginBottom: 4 }}
            >
              <Folder size={16} /> {cat.name}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div style={{ flex: 1, padding: "32px", overflowY: "auto" }}>
          
          {loading ? (
             <div style={{ padding: 40, textAlign: "center", color: "#64748B" }}>Searching knowledge base...</div>
          ) : (
            <>
              {!search && !activeCategory && (
                <div style={{ marginBottom: 32 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: 8 }}>
                    <Flame size={18} color="#EA580C" /> Featured / Most Read
                  </h2>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                    {articles.slice(0, 3).map(article => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                </div>
              )}

              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", margin: "0 0 16px 0" }}>
                {search ? `Search Results for "${search}"` : activeCategory ? categories.find(c => c.id === activeCategory)?.name : "Recent Updates"}
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {articles.length === 0 ? (
                  <div style={{ padding: 40, textAlign: "center", color: "#64748B", background: "#fff", borderRadius: 12, border: "1px solid #E2E8F0" }}>
                    No articles found matching your criteria.
                  </div>
                ) : (
                  articles.map(article => (
                    <ArticleRow key={article.id} article={article} />
                  ))
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

function ArticleCard({ article }) {
  return (
    <Link to={`/knowledge/article/${article.id}`} style={{ display: "flex", flexDirection: "column", background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: 20, textDecoration: "none", color: "inherit", transition: "all 0.2s", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: "#6D28D9", background: "#F5F3FF", padding: "4px 8px", borderRadius: 6, alignSelf: "flex-start", marginBottom: 12 }}>
        {article.category_name || "Uncategorized"}
      </div>
      <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: 800, color: "#0F172A", lineHeight: 1.4 }}>{article.title}</h3>
      <p style={{ margin: "0 0 16px 0", fontSize: 13, color: "#64748B", flex: 1, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {article.summary}
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 12, borderTop: "1px solid #F1F5F9", paddingTop: 12 }}>
        <span style={{ fontSize: 12, color: "#94A3B8", display: "flex", alignItems: "center", gap: 4 }}><User size={12} /> {article.author_name}</span>
        <span style={{ fontSize: 12, color: "#94A3B8", display: "flex", alignItems: "center", gap: 4 }}><Clock size={12} /> {new Date(article.updated_at).toLocaleDateString()}</span>
      </div>
    </Link>
  );
}

function ArticleRow({ article }) {
  return (
    <Link to={`/knowledge/article/${article.id}`} style={{ display: "flex", alignItems: "flex-start", gap: 16, background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: 20, textDecoration: "none", color: "inherit", transition: "all 0.2s" }}>
      <div style={{ background: "#F1F5F9", padding: 12, borderRadius: 10, color: "#64748B" }}>
        <FileText size={20} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#0F172A" }}>{article.title}</h3>
          <span style={{ fontSize: 11, fontWeight: 800, color: "#6D28D9", background: "#F5F3FF", padding: "2px 6px", borderRadius: 4 }}>
            {article.category_name || "Uncategorized"}
          </span>
        </div>
        <p style={{ margin: "0 0 8px 0", fontSize: 13, color: "#64748B", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {article.summary}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 12, color: "#94A3B8", display: "flex", alignItems: "center", gap: 4 }}><User size={12} /> {article.author_name}</span>
          <span style={{ fontSize: 12, color: "#94A3B8", display: "flex", alignItems: "center", gap: 4 }}><Clock size={12} /> Updated: {new Date(article.updated_at).toLocaleDateString()}</span>
          {article.views > 0 && <span style={{ fontSize: 12, color: "#94A3B8", display: "flex", alignItems: "center", gap: 4 }}><BookOpen size={12} /> {article.views} reads</span>}
        </div>
      </div>
    </Link>
  );
}
