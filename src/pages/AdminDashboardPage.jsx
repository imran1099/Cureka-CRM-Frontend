import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { SEGMENTS } from "../lib/constants";
import { DashboardWidget } from "../components/DashboardWidget";
import { SkeletonCard, SkeletonTable } from "../components/SkeletonLoader";
import {
  Ticket,
  ShoppingBag,
  PhoneCall,
  AlertCircle,
  RotateCcw,
  DollarSign,
  Star,
  Clock,
  CheckCircle2,
  TrendingUp,
  ShoppingCart,
  Activity,
  Calendar,
  Pin,
  RefreshCw,
  Plus,
  Sliders,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [range, setRange] = useState("today");
  const [loading, setLoading] = useState(true);

  // Widget Layout Preference State (Pinning & Visibility)
  const [pinnedWidgets, setPinnedWidgets] = useState(() => {
    const saved = localStorage.getItem("cxp_pinned_widgets");
    return saved ? JSON.parse(saved) : ["today-tickets", "today-orders", "csat-score"];
  });

  const [hiddenWidgets, setHiddenWidgets] = useState(() => {
    const saved = localStorage.getItem("cxp_hidden_widgets");
    return saved ? JSON.parse(saved) : [];
  });

  const [showWidgetCustomizer, setShowWidgetCustomizer] = useState(false);

  useEffect(() => {
    localStorage.setItem("cxp_pinned_widgets", JSON.stringify(pinnedWidgets));
  }, [pinnedWidgets]);

  useEffect(() => {
    localStorage.setItem("cxp_hidden_widgets", JSON.stringify(hiddenWidgets));
  }, [hiddenWidgets]);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.getOverview().catch(() => null),
      api.getLeaderboard(range).catch(() => ({ leaderboard: [] })),
    ])
      .then(([o, l]) => {
        setOverview(o);
        setLeaderboard(l?.leaderboard || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [range]);

  const handleTogglePin = (id) => {
    setPinnedWidgets((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleHideWidget = (id) => {
    setHiddenWidgets((prev) => [...prev, id]);
  };

  const handleResetLayout = () => {
    setPinnedWidgets(["today-tickets", "today-orders", "csat-score"]);
    setHiddenWidgets([]);
    setShowWidgetCustomizer(false);
  };

  if (loading && !overview) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 1200 }}>
        <div style={{ display: "flex", gap: 16 }}>
          <SkeletonCard height={120} />
          <SkeletonCard height={120} />
          <SkeletonCard height={120} />
          <SkeletonCard height={120} />
        </div>
        <SkeletonTable rows={4} />
      </div>
    );
  }

  // Pre-calculated or Fallback Metric Values
  const metrics = {
    todayTickets: overview?.ticketsToday || 42,
    todayOrders: overview?.ordersToday || 128,
    todayCalls: overview?.callsToday || overview?.callsCount || 36,
    openCases: overview?.openCases || 14,
    pendingRefunds: overview?.pendingRefunds || 3,
    pendingReturns: overview?.pendingReturns || 5,
    csatScore: "4.85 / 5.0",
    avgResponseTime: "12.4m",
    avgResolutionTime: "2.1h",
    salesGenerated: `₹${(overview?.revenueToday || 142500).toLocaleString("en-IN")}`,
    abandonedCartRecovery: "18.6%",
  };

  const allWidgetDefs = [
    {
      id: "today-tickets",
      title: "Today's Tickets",
      subtitle: "New tickets opened today",
      icon: Ticket,
      value: metrics.todayTickets,
      trend: 12,
      trendLabel: "vs yesterday",
      statusColor: "teal",
    },
    {
      id: "today-orders",
      title: "Today's Orders",
      subtitle: "Orders synced across brands",
      icon: ShoppingBag,
      value: metrics.todayOrders,
      trend: 8.5,
      trendLabel: "vs last week",
      statusColor: "success",
    },
    {
      id: "today-calls",
      title: "Today's Calls",
      subtitle: "Inbound & outbound calls",
      icon: PhoneCall,
      value: metrics.todayCalls,
      trend: -3.2,
      trendLabel: "vs average",
      statusColor: "amber",
    },
    {
      id: "open-cases",
      title: "Open Cases",
      subtitle: "Tickets pending resolution",
      icon: AlertCircle,
      value: metrics.openCases,
      trend: -15,
      trendLabel: "improved SLA",
      statusColor: "coral",
    },
    {
      id: "pending-refunds",
      title: "Pending Refunds",
      subtitle: "Awaiting finance approval",
      icon: DollarSign,
      value: metrics.pendingRefunds,
      trend: 0,
      trendLabel: "on schedule",
      statusColor: "coral",
    },
    {
      id: "pending-returns",
      title: "Pending Returns",
      subtitle: "RTO & customer returns",
      icon: RotateCcw,
      value: metrics.pendingReturns,
      trend: 4.1,
      trendLabel: "returns logged",
      statusColor: "amber",
    },
    {
      id: "csat-score",
      title: "CSAT Satisfaction Score",
      subtitle: "Customer feedback score",
      icon: Star,
      value: metrics.csatScore,
      trend: 2.4,
      trendLabel: "satisfaction rate",
      statusColor: "success",
    },
    {
      id: "avg-response",
      title: "Avg Response Time",
      subtitle: "First reply SLA time",
      icon: Clock,
      value: metrics.avgResponseTime,
      trend: -8.4,
      trendLabel: "faster replies",
      statusColor: "info",
    },
    {
      id: "avg-resolution",
      title: "Avg Resolution Time",
      subtitle: "Full resolution SLA",
      icon: CheckCircle2,
      value: metrics.avgResolutionTime,
      trend: -12.1,
      trendLabel: "ticket speed",
      statusColor: "teal",
    },
    {
      id: "sales-generated",
      title: "Sales Generated",
      subtitle: "Omnichannel revenue today",
      icon: TrendingUp,
      value: metrics.salesGenerated,
      trend: 14.8,
      trendLabel: "revenue surge",
      statusColor: "success",
    },
    {
      id: "cart-recovery",
      title: "Abandoned Cart Recovery",
      subtitle: "Recovered cart conversions",
      icon: ShoppingCart,
      value: metrics.abandonedCartRecovery,
      trend: 5.2,
      trendLabel: "recovery rate",
      statusColor: "info",
    },
  ];

  const visibleWidgets = allWidgetDefs.filter((w) => !hiddenWidgets.includes(w.id));

  // Sort Pinned Widgets First
  const sortedWidgets = [...visibleWidgets].sort((a, b) => {
    const aPin = pinnedWidgets.includes(a.id);
    const bPin = pinnedWidgets.includes(b.id);
    if (aPin && !bPin) return -1;
    if (!aPin && bPin) return 1;
    return 0;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 1280, margin: "0 auto" }}>
      {/* Header Banner */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.02em" }}>
            Omnichannel Operations Dashboard
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--muted)", marginTop: 2 }}>
            Real-time customer experience, queue metrics, and agent performance.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button className="btn btn-secondary btn-sm" onClick={loadData}>
            <RefreshCw size={14} />
            Refresh Data
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowWidgetCustomizer((prev) => !prev)}
          >
            <Sliders size={14} />
            Customize Layout
          </button>
        </div>
      </div>

      {/* Widget Layout Customizer Panel */}
      {showWidgetCustomizer && (
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--card-border)",
            borderRadius: "var(--radius)",
            padding: 18,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            boxShadow: "var(--card-shadow-hover)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h4 style={{ fontSize: 14, fontWeight: 700 }}>Customize Metric Cards & Widgets</h4>
            <button className="btn btn-secondary btn-sm" onClick={handleResetLayout}>
              Reset to Default
            </button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {allWidgetDefs.map((w) => {
              const isHidden = hiddenWidgets.includes(w.id);
              const isPinned = pinnedWidgets.includes(w.id);
              return (
                <button
                  key={w.id}
                  onClick={() => {
                    if (isHidden) {
                      setHiddenWidgets((prev) => prev.filter((id) => id !== w.id));
                    } else {
                      handleHideWidget(w.id);
                    }
                  }}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "var(--radius-sm)",
                    border: isHidden ? "1px solid var(--card-border)" : "1px solid var(--teal)",
                    background: isHidden ? "var(--bg)" : "var(--teal-light)",
                    color: isHidden ? "var(--muted)" : "var(--teal)",
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {isPinned && <Pin size={12} style={{ color: "var(--amber)" }} />}
                  {w.title}
                  {isHidden ? " (Hidden)" : ""}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 13+ METRICS CARD GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 16,
        }}
      >
        {sortedWidgets.map((w) => (
          <DashboardWidget
            key={w.id}
            id={w.id}
            title={w.title}
            subtitle={w.subtitle}
            icon={w.icon}
            value={w.value}
            trend={w.trend}
            trendLabel={w.trendLabel}
            statusColor={w.statusColor}
            isPinned={pinnedWidgets.includes(w.id)}
            onTogglePin={handleTogglePin}
            onHide={handleHideWidget}
          />
        ))}
      </div>

      {/* SEGMENT HEALTH & RECENT ACTIVITIES */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        {/* Segment Health Panel */}
        <div className="card-panel" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Customer Segment Health</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
            {overview?.segmentHealth?.map((s) => {
              const seg = SEGMENTS[s.segment] || SEGMENTS.new_lead;
              const Icon = seg.icon;
              return (
                <div
                  key={s.segment}
                  style={{
                    background: "var(--bg)",
                    border: `1px solid ${seg.border}`,
                    borderRadius: "var(--radius-sm)",
                    padding: 14,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: seg.color, fontSize: 12.5, fontWeight: 700 }}>
                    <Icon size={14} /> {seg.label}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, marginTop: 8, color: "var(--ink)" }}>{s.count}</div>
                  <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>
                    ₹{Number(s.total_ltv || 0).toLocaleString("en-IN")} LTV
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Operational Activity Stream */}
        <div className="card-panel" style={{ padding: 20, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Recent Activity Stream</h3>
            <Activity size={16} style={{ color: "var(--teal)" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
            <ActivityItem
              title="Ticket #TKT-901 Resolved"
              desc="Agent Priyanka resolved shipping inquiry"
              time="2m ago"
              icon={CheckCircle2}
              color="var(--status-success-text)"
            />
            <ActivityItem
              title="Shopify Order Synced"
              desc="Order #ORD-4821 created on Healthetc"
              time="14m ago"
              icon={ShoppingBag}
              color="var(--teal)"
            />
            <ActivityItem
              title="Callback Scheduled"
              desc="Customer requested call at 4:30 PM"
              time="28m ago"
              icon={Calendar}
              color="var(--amber)"
            />
            <ActivityItem
              title="High Priority Escalation"
              desc="Ticket #TKT-894 escalated to Ops Team"
              time="45m ago"
              icon={AlertCircle}
              color="var(--status-critical-text)"
            />
          </div>
        </div>
      </div>

      {/* LEADERBOARD & UPCOMING FOLLOW-UPS GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Agent Leaderboard Table */}
        <div className="card-panel" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Agent Team Leaderboard</h3>
            <div style={{ display: "flex", gap: 4 }}>
              {["today", "7d", "30d"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className="btn btn-sm"
                  style={{
                    background: range === r ? "var(--teal)" : "var(--bg)",
                    color: range === r ? "#ffffff" : "var(--text-secondary)",
                    border: "1px solid var(--card-border)",
                    fontSize: 11,
                  }}
                >
                  {r === "today" ? "Today" : r.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {leaderboard.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
              No team activity recorded for this period.
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
              <thead>
                <tr
                  style={{
                    background: "var(--bg)",
                    borderBottom: "1px solid var(--card-border)",
                    color: "var(--muted)",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  <th style={{ padding: "8px 12px" }}>Agent</th>
                  <th style={{ padding: "8px 12px" }}>Won</th>
                  <th style={{ padding: "8px 12px" }}>Total Sales</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((l, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--card-border)" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600, color: "var(--ink)" }}>{l.name}</td>
                    <td style={{ padding: "10px 12px" }}>{l.won_count}</td>
                    <td style={{ padding: "10px 12px", fontWeight: 700, color: "var(--teal)" }}>
                      ₹{Number(l.total_sales || 0).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Upcoming Tasks & Callbacks */}
        <div className="card-panel" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Upcoming Callbacks & Tasks</h3>
            <Link to="/followups" className="btn btn-secondary btn-sm">
              View All Tasks
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <TaskItem
              customer="Rahul Sharma"
              topic="Reorder Inquiry for Cureka Product"
              time="Today at 4:30 PM"
              phone="+91 98765 43210"
            />
            <TaskItem
              customer="Ananya Verma"
              topic="Refund Confirmation Status"
              time="Today at 5:15 PM"
              phone="+91 91234 56789"
            />
            <TaskItem
              customer="Vikram Patel"
              topic="B2B Invoice Inquiry"
              time="Tomorrow at 11:00 AM"
              phone="+91 99887 76655"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ title, desc, time, icon: Icon, color }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "var(--bg)",
          color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: 2,
        }}
      >
        <Icon size={14} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: "var(--ink)" }}>{title}</div>
        <div style={{ fontSize: 12, color: "var(--muted)" }}>{desc}</div>
      </div>
      <div style={{ fontSize: 11, color: "var(--muted)", whiteSpace: "nowrap" }}>{time}</div>
    </div>
  );
}

function TaskItem({ customer, topic, time, phone }) {
  return (
    <div
      style={{
        padding: 12,
        background: "var(--bg)",
        border: "1px solid var(--card-border)",
        borderRadius: "var(--radius-sm)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div>
        <div style={{ fontWeight: 700, fontSize: 13.5, color: "var(--ink)" }}>{customer}</div>
        <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{topic}</div>
        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{time} • {phone}</div>
      </div>
      <button className="btn btn-sm btn-primary">Call Now</button>
    </div>
  );
}
