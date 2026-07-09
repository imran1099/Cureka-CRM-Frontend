import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./auth";
import { api } from "./api";

const BrandContext = createContext(null);

export function BrandProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [brands, setBrands] = useState([]);
  const [selectedBrandId, setSelectedBrandIdState] = useState(null);
  const [loading, setLoading] = useState(true);

  const setSelectedBrandId = useCallback((id) => {
    setSelectedBrandIdState(id);
    if (id) {
      localStorage.setItem("cureka_selected_brand", id);
    } else {
      localStorage.removeItem("cureka_selected_brand");
    }
  }, []);

  useEffect(() => {
    if (authLoading) return; // Wait for auth to complete

    if (!user) {
      setBrands([]);
      setSelectedBrandId(null);
      setLoading(false);
      return;
    }

    // Fetch brands
    api.listBrands()
      .then((res) => {
        setBrands(res.brands || []);

        // Auto-select logic
        const saved = localStorage.getItem("cureka_selected_brand");
        if (saved && (res.brands.some(b => b.id === saved) || saved === "all" && ["admin", "general_manager", "operations_manager"].includes(user.role))) {
          setSelectedBrandIdState(saved);
        } else if (res.brands.length > 0) {
          // If admin/gm, default to 'all'. Else default to first brand.
          if (["admin", "general_manager", "operations_manager"].includes(user.role)) {
            setSelectedBrandIdState("all");
            localStorage.setItem("cureka_selected_brand", "all");
            console.log("cureka_selected_brand", "all");

          } else {
            setSelectedBrandIdState(res.brands[0].id);
            localStorage.setItem("cureka_selected_brand", res.brands[0].id);
            console.log("cureka_selected_brand", res.brands[0].id);
          }
        }
      })
      .catch(err => console.error("Failed to load brands", err))
      .finally(() => setLoading(false));
  }, [user, setSelectedBrandId]);

  return (
    <BrandContext.Provider value={{ brands, selectedBrandId, setSelectedBrandId, loading }}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  const ctx = useContext(BrandContext);
  if (!ctx) throw new Error("useBrand must be used within BrandProvider");
  return ctx;
}
