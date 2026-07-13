import React from "react";
import { useAuth } from "../lib/auth.jsx";

export default function MaskedField({ type = "text", value, fallback = "N/A" }) {
  const { hasPermission, user } = useAuth();
  
  // Super Admin and GM have unrestricted access
  const isManagement = ["super_admin", "admin", "general_manager"].includes(user?.role);
  const canUnmask = isManagement || hasPermission("customers", "unmask");

  if (!value) return fallback;

  if (canUnmask) {
    return <span>{value}</span>;
  }

  // Masking logic
  let maskedValue = value;
  
  if (type === "email") {
    const parts = value.split("@");
    if (parts.length === 2) {
      const name = parts[0];
      const domain = parts[1];
      const maskedName = name.length > 2 ? name.substring(0, 2) + "***" : "***";
      maskedValue = `${maskedName}@${domain}`;
    }
  } else if (type === "phone") {
    if (value.length >= 10) {
      maskedValue = value.substring(0, 5) + "XXXXX";
    } else {
      maskedValue = "XXXXX";
    }
  } else {
    // Default text masking
    maskedValue = value.length > 4 ? value.substring(0, Math.ceil(value.length / 2)) + "***" : "***";
  }

  return (
    <span title="You do not have permission to view full details" style={{ cursor: "not-allowed", opacity: 0.8 }}>
      {maskedValue}
    </span>
  );
}
