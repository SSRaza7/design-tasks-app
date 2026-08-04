import { useState, useMemo } from "react";
import { DonutChart, ChartLegend } from "./DonutChart";
import { SURFACE, SURFACE_2, BORDER, TEXT, TEXT_MUTED, inputStyle } from "../lib/constants";

const fontStack = "'Manrope', Helvetica, Arial, sans-serif";

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function groupCount(items, keyFn) {
  const map = {};
  items.forEach((item) => {
    const key = keyFn(item);
    if (!key) return;
    map[key] = (map[key] || 0) + 1;
  });
  return Object.entries(map)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

export default function Dashboard({ tasks, role, isTeamLead }) {
  const [dateFrom, setDateFrom] = useState(daysAgo(30));
  const [dateTo, setDateTo] = useState(daysAgo(0));
  const [geoFilter, setGeoFilter] = useState("all");

  const geoOptions = useMemo(
    () => Array.from(new Set(tasks.map((t) => t.geo).filter(Boolean))).sort(),
    [tasks]
  );

  const inRange = useMemo(() => {
    const from = new Date(dateFrom + "T00:00:00");
    const to = new Date(dateTo + "T23:59:59");
    return tasks.filter((t) => {
      const created = new Date(t.created_at);
      return created >= from && created <= to;
    });
  }, [tasks, dateFrom, dateTo]);

  const geoFiltered = useMemo(
    () => (geoFilter === "all" ? inRange : inRange.filter((t) => t.geo === geoFilter)),
    [inRange, geoFilter]
  );

  const byBuyer = useMemo(() => groupCount(geoFiltered, (t) => t.posted_by), [geoFiltered]);
  const byGeo = useMemo(() => groupCount(inRange, (t) => t.geo), [inRange]);
  const byDesigner = useMemo(
    () => groupCount(geoFiltered.filter((t) => t.status === "Готово"), (t) => t.assigned_designer),
    [geoFiltered]
  );

  const showBuyerChart = role === "designer" || isTeamLead;

  const cardStyle = {
    background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "12px",
    padding: "20px", flex: "1 1 320px", minWidth: 0,
  };

  return (
    <div>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "24px" }}>
        <div>
          <div style={{ fontSize: "11px", color: TEXT_MUTED, marginBottom: "4px" }}>Период с</div>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <div style={{ fontSize: "11px", color: TEXT_MUTED, marginBottom: "4px" }}>по</div>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <div style={{ fontSize: "11px", color: TEXT_MUTED, marginBottom: "4px" }}>Гео</div>
          <select value={geoFilter} onChange={(e) => setGeoFilter(e.target.value)} style={inputStyle}>
            <option value="all">Все гео</option>
            {geoOptions.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        {showBuyerChart && (
          <div style={cardStyle}>
            <div style={{ fontFamily: fontStack, fontWeight: 600, fontSize: "14px", color: TEXT, marginBottom: "16px" }}>
              Задачи по баерам
            </div>
            <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
              <DonutChart data={byBuyer} />
              <ChartLegend data={byBuyer} />
            </div>
          </div>
        )}

        <div style={cardStyle}>
          <div style={{ fontFamily: fontStack, fontWeight: 600, fontSize: "14px", color: TEXT, marginBottom: "16px" }}>
            Задачи по гео
          </div>
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            <DonutChart data={byGeo} />
            <ChartLegend data={byGeo} />
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontFamily: fontStack, fontWeight: 600, fontSize: "14px", color: TEXT, marginBottom: "4px" }}>
            Выполнено дизайнерами
          </div>
          <div style={{ fontSize: "11px", color: TEXT_MUTED, marginBottom: "16px" }}>задачи со статусом «Готово»</div>
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            <DonutChart data={byDesigner} />
            <ChartLegend data={byDesigner} />
          </div>
        </div>
      </div>
    </div>
  );
}
