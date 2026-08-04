import { CHART_COLORS, TEXT, TEXT_MUTED, SURFACE_2 } from "../lib/constants";

export function DonutChart({ data, size = 150 }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  let cumulative = 0;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg viewBox="0 0 100 100" style={{ width: size, height: size, transform: "rotate(-90deg)" }}>
        <circle cx="50" cy="50" r={radius} fill="none" stroke={SURFACE_2} strokeWidth="16" />
        {total > 0 &&
          data.map((d, i) => {
            const fraction = d.value / total;
            const length = fraction * circumference;
            const offset = cumulative;
            cumulative += length;
            if (d.value === 0) return null;
            return (
              <circle
                key={d.label}
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={CHART_COLORS[i % CHART_COLORS.length]}
                strokeWidth="16"
                strokeDasharray={`${length} ${circumference - length}`}
                strokeDashoffset={-offset}
              />
            );
          })}
      </svg>
      <div
        style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}
      >
        <div style={{ fontSize: "22px", fontWeight: 700, color: TEXT, lineHeight: 1 }}>{total}</div>
        <div style={{ fontSize: "10.5px", color: TEXT_MUTED, marginTop: "2px" }}>всего</div>
      </div>
    </div>
  );
}

export function ChartLegend({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1, minWidth: 0 }}>
      {data.length === 0 && (
        <div style={{ fontSize: "12.5px", color: TEXT_MUTED }}>Нет данных за этот период</div>
      )}
      {data.map((d, i) => (
        <div key={d.label} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
          <span
            style={{
              width: "10px", height: "10px", borderRadius: "3px", flexShrink: 0,
              background: CHART_COLORS[i % CHART_COLORS.length],
            }}
          />
          <span style={{ color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
            {d.label}
          </span>
          <span style={{ color: TEXT_MUTED, fontSize: "12px", whiteSpace: "nowrap" }}>
            {d.value} ({Math.round((d.value / total) * 100)}%)
          </span>
        </div>
      ))}
    </div>
  );
}
