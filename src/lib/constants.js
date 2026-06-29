import { Clock, ShoppingCart, TrendingUp, UserX, UserPlus, CheckCircle2, XCircle, CalendarClock, PhoneMissed, PhoneOff } from "lucide-react";

export const SEGMENTS = {
  replenishment: { label: "Replenishment due", icon: Clock, color: "var(--amber)", bg: "var(--amber-light)", border: "var(--amber-border)" },
  abandoner: { label: "Cart / browse abandoner", icon: ShoppingCart, color: "var(--teal)", bg: "var(--teal-light)", border: "var(--teal-border)" },
  dormant: { label: "High-LTV dormant", icon: TrendingUp, color: "var(--coral)", bg: "var(--coral-light)", border: "var(--coral-border)" },
  churnrisk: { label: "Single-purchase churn risk", icon: UserX, color: "var(--slate)", bg: "var(--slate-light)", border: "var(--slate-border)" },
  new_lead: { label: "New lead", icon: UserPlus, color: "#6D5BD0", bg: "#EFEBFB", border: "#D7CCF2" },
};

export const SOURCES = {
  purchase: "Past purchase",
  abandoned_cart: "Abandoned cart",
  manual_upload: "Manually added",
  referral: "Referral",
  website_lead: "Website lead",
};

export const OUTCOMES = [
  { key: "sold", label: "Sold", icon: CheckCircle2, color: "var(--teal)" },
  { key: "callback", label: "Call back later", icon: CalendarClock, color: "var(--amber)" },
  { key: "noanswer", label: "No answer", icon: PhoneMissed, color: "var(--muted)" },
  { key: "notinterested", label: "Not interested", icon: XCircle, color: "var(--muted)" },
  { key: "wrongnumber", label: "Wrong number", icon: XCircle, color: "var(--muted)" },
  { key: "disconnected", label: "Disconnected", icon: PhoneOff, color: "var(--muted)" },
];

export function outcomeMeta(key) {
  return OUTCOMES.find((o) => o.key === key) || OUTCOMES[OUTCOMES.length - 1];
}

export const OBJECTION_TYPES = [
  { key: "price", label: "Price" },
  { key: "trust", label: "Trust / skepticism" },
  { key: "spouse_approval", label: "Needs spouse/family approval" },
  { key: "has_alternative", label: "Already has a doctor/alternative" },
  { key: "timing", label: "Bad timing" },
  { key: "no_objection", label: "No objection" },
  { key: "other", label: "Other" },
];

export const SENTIMENTS = [
  { key: "positive", label: "Positive", color: "var(--teal)" },
  { key: "neutral", label: "Neutral", color: "var(--muted)" },
  { key: "negative", label: "Negative", color: "var(--coral)" },
];

export const DECISION_STYLES = [
  { key: "decisive", label: "Decisive" },
  { key: "needs_convincing", label: "Needs convincing" },
  { key: "gatekeeper_involved", label: "Gatekeeper involved" },
];

export const PRICE_SENSITIVITY = [
  { key: "low", label: "Low" },
  { key: "medium", label: "Medium" },
  { key: "high", label: "High" },
];

export const CONTACT_TIMES = [
  { key: "morning", label: "Morning" },
  { key: "afternoon", label: "Afternoon" },
  { key: "evening", label: "Evening" },
  { key: "any", label: "Any time" },
];

// Suggested starting tags — agents aren't limited to these, but it speeds up tagging and keeps vocabulary consistent
export const SUGGESTED_TAGS = {
  health: ["diabetes", "joint pain", "hypertension", "thyroid", "PCOS", "low immunity", "digestive issues", "sleep issues", "weight management"],
  preference: ["ayurvedic preferred", "allopathic preferred", "sugar-free", "vegetarian", "budget-conscious", "premium preferred", "subscription interested"],
  behavioral: ["price sensitive", "brand loyal", "research-heavy", "quick decision maker", "needs reassurance", "prefers WhatsApp", "prefers calls only"],
};
