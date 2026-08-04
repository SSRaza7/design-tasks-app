import { STATUSES, STATUS_META, SURFACE_1, BORDER, BORDER_CARD_HOVER, TEXT, TEXT_QUIET, TEXT_QUIETEST, TEXT_DESC, LIME, FONT_MONO, FONT_UI } from "../lib/constants";

const HINTS = {
  "Ожидание": "без исполнителя",
  "В работе": "в процессе",
  "На ревью": "ждут ревью",
  "Готово": "за неделю",
};

export default function StatusSummary({ tasks, onSelectStatus }) {
  const total = tasks.length || 1;
  return (
    <div style={{ padding: "16px 24px 14px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
      {STATUSES.map((status) => {
        const meta = STATUS_META[status];
        const count = tasks.filter((t) => t.status === status).length;
        const share = Math.round((count / total) * 100);
        return (
          <div
            key={status}
            onClick={() => onSelectStatus(status)}
            className="status-card"
            style={{
              background: SURFACE_1, border: `1px solid ${BORDER}`, borderRadius: "12px",
              padding: "13px 14px", cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "7px", fontFamily: FONT_MONO, fontSize: "9.5px", letterSpacing: ".14em", color: TEXT_DESC }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "2px", background: meta.marker }} />
                {status.toUpperCase()}
              </span>
              <span style={{ fontFamily: FONT_MONO, fontSize: "10px", color: TEXT_QUIETEST }}>{share}%</span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", marginTop: "9px" }}>
              <div style={{ fontFamily: FONT_UI, fontSize: "28px", fontWeight: 800, letterSpacing: "-.03em", lineHeight: 1, color: status === "В работе" ? LIME : TEXT }}>
                {count}
              </div>
              <div style={{ fontSize: "11.5px", color: TEXT_QUIET, paddingBottom: "3px" }}>{HINTS[status]}</div>
            </div>
            <div style={{ height: "3px", borderRadius: "3px", background: BORDER, marginTop: "11px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${share}%`, background: meta.marker, borderRadius: "3px" }} />
            </div>
          </div>
        );
      })}
      <style>{`.status-card:hover { border-color: ${BORDER_CARD_HOVER} !important; }`}</style>
    </div>
  );
}
