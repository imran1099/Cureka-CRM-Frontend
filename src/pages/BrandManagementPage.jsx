import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useBrand } from "../lib/BrandContext";

export default function BrandManagementPage() {
  const { brands: globalBrands, setSelectedBrandId } = useBrand();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBrand, setCurrentBrand] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    short_code: "",
    support_email: "",
    support_phone: "",
    primary_domain: "",
  });

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await api.listBrands();
      setBrands(res.brands);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleOpenModal = (brand = null) => {
    if (brand) {
      setCurrentBrand(brand);
      setFormData({
        name: brand.name,
        short_code: brand.short_code,
        support_email: brand.support_email || "",
        support_phone: brand.support_phone || "",
        primary_domain: brand.primary_domain || "",
      });
    } else {
      setCurrentBrand(null);
      setFormData({ name: "", short_code: "", support_email: "", support_phone: "", primary_domain: "" });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (currentBrand) {
        await api.updateBrand(currentBrand.id, formData);
      } else {
        await api.createBrand(formData);
      }
      setIsModalOpen(false);
      fetchBrands();
      // Reload the page to refresh context
      window.location.reload();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this brand?")) return;
    try {
      await api.deleteBrand(id);
      fetchBrands();
      window.location.reload();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>Brand Management</h1>
        <button className="btn primary" onClick={() => handleOpenModal()}>+ Add Brand</button>
      </header>

      {loading ? (
        <p>Loading brands...</p>
      ) : (
        <table className="table" style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 8, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <thead style={{ background: "#f8fafc", textAlign: "left" }}>
            <tr>
              <th style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0" }}>Name</th>
              <th style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0" }}>Short Code</th>
              <th style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0" }}>Email</th>
              <th style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0" }}>Domain</th>
              <th style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {brands.map(b => (
              <tr key={b.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "12px 16px", fontWeight: "500" }}>{b.name}</td>
                <td style={{ padding: "12px 16px" }}>{b.short_code}</td>
                <td style={{ padding: "12px 16px" }}>{b.support_email || "-"}</td>
                <td style={{ padding: "12px 16px" }}>{b.primary_domain || "-"}</td>
                <td style={{ padding: "12px 16px", textAlign: "right" }}>
                  <button className="btn outline" style={{ marginRight: 8, padding: "4px 8px", fontSize: 12 }} onClick={() => handleOpenModal(b)}>Edit</button>
                  <button className="btn" style={{ padding: "4px 8px", fontSize: 12, color: "var(--danger)", border: "1px solid var(--danger)", background: "transparent" }} onClick={() => handleDelete(b.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {brands.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: 24, textAlign: "center", color: "#64748b" }}>No brands found</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {isModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
          <div style={{ background: "#fff", padding: 24, borderRadius: 8, width: 400 }}>
            <h2 style={{ marginTop: 0 }}>{currentBrand ? "Edit Brand" : "New Brand"}</h2>
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input type="text" placeholder="Brand Name" required className="input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input type="text" placeholder="Short Code (e.g. HE)" required className="input" value={formData.short_code} onChange={e => setFormData({...formData, short_code: e.target.value})} />
              <input type="email" placeholder="Support Email" className="input" value={formData.support_email} onChange={e => setFormData({...formData, support_email: e.target.value})} />
              <input type="text" placeholder="Support Phone" className="input" value={formData.support_phone} onChange={e => setFormData({...formData, support_phone: e.target.value})} />
              <input type="text" placeholder="Primary Domain" className="input" value={formData.primary_domain} onChange={e => setFormData({...formData, primary_domain: e.target.value})} />
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
                <button type="button" className="btn outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
