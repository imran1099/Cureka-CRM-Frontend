export function SkeletonCard({ height = 120 }) {
  return (
    <div
      className="card-panel"
      style={{
        padding: 20,
        height,
        display: "flex",
        flexDirection: "column",
        justify: "space-between",
        gap: 12,
      }}
    >
      <div className="skeleton" style={{ width: "40%", height: 16 }} />
      <div className="skeleton" style={{ width: "70%", height: 28 }} />
      <div className="skeleton" style={{ width: "30%", height: 14 }} />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="card-panel" style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
        <div className="skeleton" style={{ width: 200, height: 36 }} />
        <div className="skeleton" style={{ width: 120, height: 36 }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div className="skeleton" style={{ width: 24, height: 24, borderRadius: 4 }} />
            <div className="skeleton" style={{ flex: 1, height: 20 }} />
            <div className="skeleton" style={{ width: 100, height: 20 }} />
            <div className="skeleton" style={{ width: 80, height: 20 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
