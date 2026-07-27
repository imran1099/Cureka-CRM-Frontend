import { useState, useEffect, createContext, useContext } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "info", duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          maxWidth: 380,
          width: "100%",
          pointerEvents: "none",
        }}
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

function ToastItem({ toast, onClose }) {
  const { message, type } = toast;

  const typeStyles = {
    success: {
      bg: "var(--status-success-bg)",
      text: "var(--status-success-text)",
      border: "var(--status-success-border)",
      icon: CheckCircle2,
    },
    warning: {
      bg: "var(--status-pending-bg)",
      text: "var(--status-pending-text)",
      border: "var(--status-pending-border)",
      icon: AlertTriangle,
    },
    error: {
      bg: "var(--status-critical-bg)",
      text: "var(--status-critical-text)",
      border: "var(--status-critical-border)",
      icon: XCircle,
    },
    info: {
      bg: "var(--status-info-bg)",
      text: "var(--status-info-text)",
      border: "var(--status-info-border)",
      icon: Info,
    },
  };

  const style = typeStyles[type] || typeStyles.info;
  const Icon = style.icon;

  return (
    <div
      style={{
        pointerEvents: "auto",
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "12px 16px",
        borderRadius: "var(--radius)",
        background: "var(--card)",
        color: "var(--ink)",
        border: `1px solid ${style.border}`,
        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
        fontSize: 13.5,
        lineHeight: "1.4",
      }}
    >
      <Icon size={18} style={{ color: style.text, flexShrink: 0, marginTop: 1 }} />
      <div style={{ flex: 1, color: "var(--ink)", fontWeight: 500 }}>{message}</div>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          padding: 0,
          color: "var(--muted)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
        }}
      >
        <X size={15} />
      </button>
    </div>
  );
}
