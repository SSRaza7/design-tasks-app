import {
  STATUSES, STATUS_META, priorityMeta, countryFlag, formatDateTime,
  SURFACE_1, SURFACE_CARD, SURFACE_RAISED, BORDER, BORDER_CHIP,
  TEXT, TEXT_MUTED, TEXT_QUIET, TEXT_QUIETEST, LIME, FONT_MONO, FONT_UI,
} from "../lib/constants";

function initials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function TaskKanbanView({ tasks, onOpen }) {
  return (
    <div style={{ padding: "0 24px 32px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", alignItems: "start" }}>
      {STATUSES.map((status) => {
        const meta = STATUS_META[status];
        const items = tasks.filter((t) => t.status === status);
        return (
          <div key={status} style={{ background: SURFACE_1, border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "10px" }}>
            <div style={{ padding: "2px 4px 10px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "2px", background: meta.marker }} />
              <span style={{ fontFamily: FONT_MONO, fontSize: "10px", letterSpacing: ".14em", color: TEXT_MUTED }}>{status.toUpperCase()}</span>
              <span style={{ fontFamily: FONT_MONO, fontSize: "10px", color: TEXT_QUIETEST, marginLeft: "auto" }}>{items.length}</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {items.map((task) => {
                const pm = priorityMeta(task.priority);
                const assigned = !!task.assigned_designer;
                return (
                  <div
                    key={task.id}
                    onClick={() => onOpen(task)}
                    className="kanban-card"
                    style={{
                      background: SURFACE_CARD, border: `1px solid ${BORDER_CHIP}`, borderLeft: `2px solid ${meta.marker}`,
                      borderRadius: "9px", padding: "11px 12px", cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "7px" }}>
                      <span style={{ fontFamily: FONT_MONO, fontSize: "9.5px", color: TEXT_QUIET }}>DES-{String(task.id).padStart(3, "0")}</span>
                      <span style={{ fontSize: "14px", marginLeft: "auto" }}>{countryFlag(task.geo)}</span>
                    </div>
                    <div style={{ fontFamily: FONT_UI, fontSize: "13.5px", fontWeight: 600, color: TEXT, lineHeight: 1.35, marginBottom: "10px" }}>
                      {task.title}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                      <div
                        style={{
                          width: "22px", height: "22px", borderRadius: "6px", display: "grid", placeItems: "center",
                          fontFamily: FONT_MONO, fontWeight: 700, fontSize: "9.5px", flexShrink: 0,
                          color: assigned ? LIME : TEXT_QUIETEST,
                          background: assigned ? SURFACE_RAISED : "transparent",
                          border: assigned ? "1px solid #2f3624" : `1px dashed ${BORDER_CHIP}`,
                        }}
                      >
                        {assigned ? initials(task.assigned_designer) : "?"}
                      </div>
                      <span style={{ fontSize: "11.5px", color: TEXT_MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {task.assigned_designer || "не назначен"}
                      </span>
                      <span style={{ fontFamily: FONT_MONO, fontSize: "10px", color: TEXT_QUIETEST, marginLeft: "auto", whiteSpace: "nowrap" }}>
                        {formatDateTime(new Date(task.created_at))}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      <style>{`.kanban-card:hover { background: #171b0e !important; border-color: #2b3122 !important; }`}</style>
    </div>
  );
}
