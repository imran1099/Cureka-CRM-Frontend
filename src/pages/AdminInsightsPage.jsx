import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { SEGMENTS, OBJECTION_TYPES, SENTIMENTS } from "../lib/constants";
import {
  AlertCircle, TrendingDown, TrendingUp, Clock, Users, IndianRupee,
  ExternalLink, Tag as TagIcon, ArrowRight, Lightbulb,
} from "lucide-react";

const TABS = [
  { key: "attention", label: "Needs attention" },
  { key: "agents", label: "Agent coaching" },
  { key: "conversion", label: "Conversion patterns" },
];

export default function AdminInsightsPage() {
  const [tab, setTab] = useState("attention");
  const [range, setRange] = useState("7d");

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1080 }}>
      <h1 style={{ fontSize: 21, fontWeight: 800, margin: "0 0 4px" }}>Insights</h1>
      <p style={{ fontSize: 13.5, color: "var(--muted)", margin: "0 0 20px" }}>
        Patterns across your customer base and team — turned into next actions, not just numbers.
      </p>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                fontSize: 13,
                fontWeight: 700,
                padding: "8px 14px",
                borderRadius: 9,
                border: "1px solid var(--slate-border)",
                background: tab === t.key ? "var(--teal)" : "#fff",
                color: tab === t.key ? "#fff" : "var(--slate)",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
        {tab !== "attention" && (
          <div style={{ display: "flex", gap: 6 }}>
            {["today", "7d", "30d"].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--slate-border)",
                  background: range === r ? "var(--ink)" : "#fff",
                  color: range === r ? "#fff" : "var(--slate)",
                }}
              >
                {r === "today" ? "Today" : r === "7d" ? "7 days" : "30 days"}
              </button>
            ))}
          </div>
        )}
      </div>

      {tab === "attention" && <AttentionTab />}
      {tab === "agents" && <AgentsTab range={range} />}
      {tab === "conversion" && <ConversionTab range={range} />}
    </div>
  );
}

// ---------------- Tab 1: Needs attention ----------------

function AttentionTab() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.getInsightsAttention().then(setData);
  }, []);

  if (!data) return <div style={{ color: "var(--muted)", fontSize: 13.5 }}>Loading…</div>;

  const { segmentRollup, dormantPiling, overdueCallbacks, staleReplenishment, unassignedCount } = data;

  return (
    <div>
      {/* Headline alerts */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
        <AlertStat
          icon={Clock}
          label="Overdue callbacks"
          value={overdueCallbacks.length}
          tone={overdueCallbacks.length > 0 ? "warn" : "ok"}
          detail="Promises made to customers, now late"
        />
        <AlertStat
          icon={TrendingDown}
          label="High-LTV dormant"
          value={dormantPiling.length}
          tone={dormantPiling.length > 3 ? "warn" : "neutral"}
          detail="Best customers gone quiet"
        />
        <AlertStat
          icon={Clock}
          label="Replenishment overdue"
          value={staleReplenishment.length}
          tone={staleReplenishment.length > 0 ? "warn" : "ok"}
          detail="Revenue actively being missed"
        />
        <AlertStat icon={Users} label="Unassigned" value={unassignedCount} tone="neutral" detail="No agent owns these yet" />
      </div>

      {/* Segment rollup */}
      <SectionTitle icon={Users}>Segment health</SectionTitle>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 26 }}>
        {segmentRollup.map((s) => {
          const seg = SEGMENTS[s.segment] || SEGMENTS.new_lead;
          const SegIcon = seg.icon;
          return (
            <div key={s.segment} style={{ background: "#fff", border: `1px solid ${seg.border}`, borderRadius: 12, padding: "12px 16px", minWidth: 170 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: seg.color, fontSize: 12.5, fontWeight: 700 }}>
                <SegIcon size={13} /> {seg.label}
              </div>
              <div className="tabular" style={{ fontSize: 20, fontWeight: 800, marginTop: 6 }}>{s.count}</div>
              <div className="tabular" style={{ fontSize: 11.5, color: "var(--muted)" }}>
                ₹{Number(s.total_ltv || 0).toLocaleString("en-IN")} combined · avg ₹{Math.round(s.avg_ltv || 0).toLocaleString("en-IN")}
              </div>
            </div>
          );
        })}
      </div>

      {/* Overdue callbacks list */}
      {overdueCallbacks.length > 0 && (
        <>
          <SectionTitle icon={Clock} tone="warn">Overdue callbacks — act today</SectionTitle>
          <AttentionList
            items={overdueCallbacks.map((c) => ({
              id: c.id,
              name: c.name,
              phone: c.phone,
              right: `${c.days_overdue} day${c.days_overdue === 1 ? "" : "s"} overdue`,
              sub: `₹${Number(c.ltv).toLocaleString("en-IN")} LTV · ${c.agent_name || "Unassigned"}`,
              tone: "warn",
            }))}
            onOpen={(id) => navigate(`/customers/${id}`)}
          />
        </>
      )}

      {/* Stale replenishment */}
      {staleReplenishment.length > 0 && (
        <>
          <SectionTitle icon={Clock} tone="warn">Replenishment overdue — likely lost sales</SectionTitle>
          <AttentionList
            items={staleReplenishment.map((c) => ({
              id: c.id,
              name: c.name,
              phone: c.phone,
              right: `${c.days_overdue} day${c.days_overdue === 1 ? "" : "s"} overdue`,
              sub: `₹${Number(c.ltv).toLocaleString("en-IN")} LTV · ${c.agent_name || "Unassigned"}`,
              tone: "warn",
            }))}
            onOpen={(id) => navigate(`/customers/${id}`)}
          />
        </>
      )}

      {/* Dormant high LTV */}
      {dormantPiling.length > 0 && (
        <>
          <SectionTitle icon={TrendingDown}>Highest-value dormant customers</SectionTitle>
          <AttentionList
            items={dormantPiling.map((c) => ({
              id: c.id,
              name: c.name,
              phone: c.phone,
              right: `₹${Number(c.ltv).toLocaleString("en-IN")}`,
              sub: `Silent ${c.silent_days ?? "—"} days · ${c.days_since_last_call != null ? `called ${c.days_since_last_call}d ago` : "never called"} · ${c.agent_name || "Unassigned"}`,
              tone: "neutral",
            }))}
            onOpen={(id) => navigate(`/customers/${id}`)}
          />
        </>
      )}
    </div>
  );
}

// ---------------- Tab 2: Agent coaching ----------------

function AgentsTab({ range }) {
  const [agents, setAgents] = useState(null);

  useEffect(() => {
    api.getInsightsAgents(range).then((res) => setAgents(res.agents));
  }, [range]);

  if (!agents) return <div style={{ color: "var(--muted)", fontSize: 13.5 }}>Loading…</div>;

  return (
    <div>
      <SectionTitle icon={Lightbulb}>Coaching signals, not just totals</SectionTitle>
      <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: -6, marginBottom: 16 }}>
        Conversion alone doesn't say why. The top objection per agent often points to what kind of help they need.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {agents.map((a) => (
          <AgentCard key={a.id} agent={a} />
        ))}
      </div>
    </div>
  );
}

function AgentCard({ agent }) {
  const objection = agent.top_objection ? OBJECTION_TYPES.find((o) => o.key === agent.top_objection.type) : null;

  // A light-touch coaching read, not a verdict — admin decides what to do with it
  let coachingNote = null;
  if (agent.calls_made === 0) {
    coachingNote = { text: "No calls logged in this period", tone: "neutral" };
  } else if (agent.negative_calls / Math.max(agent.calls_made, 1) > 0.3) {
    coachingNote = { text: "High share of negative-sentiment calls — may need support with difficult conversations", tone: "warn" };
  } else if (objection && objection.key === "price" && agent.conversion < 15) {
    coachingNote = { text: "Price objections are common and conversion is low — may benefit from pricing/value talk-track", tone: "warn" };
  } else if (agent.conversion >= 25) {
    coachingNote = { text: "Strong conversion this period", tone: "good" };
  }

  return (
    <div style={{ background: "#fff", border: "1px solid var(--card-border)", borderRadius: 14, padding: "16px 18px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>{agent.name}</div>
        <div style={{ display: "flex", gap: 16 }}>
          <Metric label="Calls" value={agent.calls_made} />
          <Metric label="Sales" value={agent.sales} />
          <Metric label="Conversion" value={`${agent.conversion}%`} />
          <Metric label="Revenue" value={`₹${Number(agent.revenue).toLocaleString("en-IN")}`} highlight />
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
        {objection && (
          <MiniBadge label={`Top objection: ${objection.label} (${agent.top_objection.count}×)`} color="var(--coral)" />
        )}
        {agent.avg_interest_level != null && (
          <MiniBadge label={`Avg. interest read: ${agent.avg_interest_level}/5`} color="var(--teal)" />
        )}
        {agent.negative_calls > 0 && (
          <MiniBadge label={`${agent.negative_calls} negative-sentiment call${agent.negative_calls === 1 ? "" : "s"}`} color="var(--slate)" />
        )}
      </div>

      {coachingNote && (
        <div
          style={{
            marginTop: 12,
            fontSize: 12.5,
            color: coachingNote.tone === "warn" ? "var(--amber)" : coachingNote.tone === "good" ? "var(--teal)" : "var(--muted)",
            background: coachingNote.tone === "warn" ? "var(--amber-light)" : coachingNote.tone === "good" ? "var(--teal-light)" : "var(--bg)",
            borderRadius: 8,
            padding: "8px 11px",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Lightbulb size={13} /> {coachingNote.text}
        </div>
      )}
    </div>
  );
}

// ---------------- Tab 3: Conversion patterns ----------------

function ConversionTab({ range }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.getInsightsConversion(range).then(setData);
  }, [range]);

  if (!data) return <div style={{ color: "var(--muted)", fontSize: 13.5 }}>Loading…</div>;

  const { outcomeBreakdown, objectionBreakdown, sentimentBreakdown, conversionBySegment, conversionByPriceSensitivity, trendingTags } = data;
  const totalCalls = outcomeBreakdown.reduce((sum, o) => sum + o.count, 0);
  const totalObjections = objectionBreakdown.reduce((sum, o) => sum + o.count, 0);

  return (
    <div>
      {/* Objection breakdown - the headline "why aren't we converting" view */}
      <SectionTitle icon={AlertCircle}>What's blocking sales</SectionTitle>
      {objectionBreakdown.length === 0 ? (
        <EmptyNote text="No objections logged yet in this period — encourage agents to tag objections during calls for this to populate." />
      ) : (
        <BarList
          items={objectionBreakdown.map((o) => ({
            label: OBJECTION_TYPES.find((t) => t.key === o.objection_type)?.label || o.objection_type,
            count: o.count,
            pct: Math.round((o.count / totalObjections) * 100),
          }))}
          color="var(--coral)"
        />
      )}

      {/* Conversion by segment */}
      <SectionTitle icon={TrendingUp} style={{ marginTop: 26 }}>Conversion by segment</SectionTitle>
      <div style={{ background: "#fff", border: "1px solid var(--card-border)", borderRadius: 14, overflow: "hidden", marginBottom: 26 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--bg)" }}>
              <Th>Segment</Th>
              <Th align="right">Calls</Th>
              <Th align="right">Sales</Th>
              <Th align="right">Conversion</Th>
              <Th align="right">Revenue</Th>
            </tr>
          </thead>
          <tbody>
            {conversionBySegment.map((s) => {
              const seg = SEGMENTS[s.segment] || SEGMENTS.new_lead;
              return (
                <tr key={s.segment} style={{ borderTop: "1px solid var(--bg)" }}>
                  <td style={{ padding: "10px 16px", fontSize: 13, fontWeight: 600, color: seg.color }}>{seg.label}</td>
                  <td className="tabular" style={{ padding: "10px 16px", textAlign: "right", fontSize: 13 }}>{s.calls}</td>
                  <td className="tabular" style={{ padding: "10px 16px", textAlign: "right", fontSize: 13 }}>{s.sales}</td>
                  <td className="tabular" style={{ padding: "10px 16px", textAlign: "right", fontSize: 13, fontWeight: 700 }}>{s.conversion}%</td>
                  <td className="tabular" style={{ padding: "10px 16px", textAlign: "right", fontSize: 13, color: "var(--teal)", fontWeight: 700 }}>₹{Number(s.revenue).toLocaleString("en-IN")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Price sensitivity vs conversion */}
      {conversionByPriceSensitivity.length > 0 && (
        <>
          <SectionTitle icon={IndianRupee}>Price sensitivity vs. conversion</SectionTitle>
          <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: -6, marginBottom: 12 }}>
            If conversion drops sharply for "high" sensitivity customers, that's a pricing/positioning issue — not an agent skill issue.
          </p>
          <div style={{ display: "flex", gap: 10, marginBottom: 26, flexWrap: "wrap" }}>
            {conversionByPriceSensitivity.map((p) => (
              <div key={p.price_sensitivity} style={{ background: "#fff", border: "1px solid var(--card-border)", borderRadius: 12, padding: "12px 16px", minWidth: 130 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--muted)", textTransform: "capitalize" }}>{p.price_sensitivity} sensitivity</div>
                <div className="tabular" style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>{p.conversion}%</div>
                <div className="tabular" style={{ fontSize: 11, color: "var(--muted)" }}>{p.sales}/{p.calls} calls</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Sentiment breakdown */}
      <SectionTitle icon={TrendingUp}>Call sentiment</SectionTitle>
      <div style={{ display: "flex", gap: 10, marginBottom: 26, flexWrap: "wrap" }}>
        {sentimentBreakdown.map((s) => {
          const meta = SENTIMENTS.find((m) => m.key === s.sentiment);
          return (
            <div key={s.sentiment} style={{ background: "#fff", border: "1px solid var(--card-border)", borderRadius: 12, padding: "12px 16px", minWidth: 110 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: meta?.color || "var(--slate)" }}>{meta?.label || s.sentiment}</div>
              <div className="tabular" style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>{s.count}</div>
            </div>
          );
        })}
      </div>

      {/* Trending tags */}
      {trendingTags.length > 0 && (
        <>
          <SectionTitle icon={TagIcon}>Trending customer tags</SectionTitle>
          <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: -6, marginBottom: 12 }}>
            What's showing up most across your customer base — useful for content, stocking, and offer decisions.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {trendingTags.map((t) => (
              <span key={`${t.tag}-${t.tag_type}`} style={{ fontSize: 12.5, fontWeight: 600, background: "#fff", border: "1px solid var(--card-border)", borderRadius: 8, padding: "6px 11px" }}>
                {t.tag} <span className="tabular" style={{ color: "var(--muted)" }}>({t.count})</span>
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ---------------- Shared small components ----------------

function AlertStat({ icon: Icon, label, value, tone, detail }) {
  const colors = {
    warn: { bg: "var(--amber-light)", border: "var(--amber-border)", text: "var(--amber)" },
    ok: { bg: "var(--teal-light)", border: "var(--teal-border)", text: "var(--teal)" },
    neutral: { bg: "#fff", border: "var(--card-border)", text: "var(--ink)" },
  }[tone || "neutral"];

  return (
    <div style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 12, padding: "12px 16px", minWidth: 160, flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, color: colors.text, fontSize: 11.5, fontWeight: 700 }}>
        <Icon size={13} /> {label}
      </div>
      <div className="tabular" style={{ fontSize: 24, fontWeight: 800, marginTop: 4, color: colors.text }}>{value}</div>
      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{detail}</div>
    </div>
  );
}

function SectionTitle({ icon: Icon, children, tone, style }) {
  return (
    <h2 style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 7, color: tone === "warn" ? "var(--amber)" : "var(--ink)", ...style }}>
      <Icon size={15} /> {children}
    </h2>
  );
}

function AttentionList({ items, onOpen }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 26 }}>
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onOpen(item.id)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#fff",
            border: `1px solid ${item.tone === "warn" ? "var(--amber-border)" : "var(--card-border)"}`,
            borderRadius: 11,
            padding: "11px 14px",
            textAlign: "left",
            width: "100%",
          }}
        >
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700 }}>{item.name}</div>
            <div className="tabular" style={{ fontSize: 12, color: "var(--muted)" }}>{item.phone} · {item.sub}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="tabular" style={{ fontSize: 12.5, fontWeight: 700, color: item.tone === "warn" ? "var(--amber)" : "var(--teal)" }}>{item.right}</span>
            <ExternalLink size={13} style={{ opacity: 0.4 }} />
          </div>
        </button>
      ))}
    </div>
  );
}

function BarList({ items, color }) {
  const max = Math.max(...items.map((i) => i.count), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 8 }}>
      {items.map((item) => (
        <div key={item.label}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
            <span style={{ fontWeight: 600 }}>{item.label}</span>
            <span className="tabular" style={{ color: "var(--muted)" }}>{item.count} ({item.pct}%)</span>
          </div>
          <div style={{ background: "var(--bg)", borderRadius: 6, height: 8, overflow: "hidden" }}>
            <div style={{ background: color, height: "100%", width: `${(item.count / max) * 100}%`, borderRadius: 6 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Metric({ label, value, highlight }) {
  return (
    <div style={{ textAlign: "right" }}>
      <div className="tabular" style={{ fontSize: 15, fontWeight: 800, color: highlight ? "var(--teal)" : "var(--ink)" }}>{value}</div>
      <div style={{ fontSize: 10.5, color: "var(--muted)", fontWeight: 600 }}>{label}</div>
    </div>
  );
}

function MiniBadge({ label, color }) {
  return (
    <span style={{ fontSize: 11.5, fontWeight: 600, color, background: `${color}14`, borderRadius: 7, padding: "4px 9px" }}>
      {label}
    </span>
  );
}

function EmptyNote({ text }) {
  return <div style={{ fontSize: 12.5, color: "var(--muted)", background: "var(--bg)", borderRadius: 10, padding: "12px 14px", marginBottom: 20 }}>{text}</div>;
}

function Th({ children, align = "left" }) {
  return <th style={{ padding: "10px 16px", fontSize: 11, fontWeight: 700, color: "var(--muted)", textAlign: align, textTransform: "uppercase", letterSpacing: "0.03em" }}>{children}</th>;
}
