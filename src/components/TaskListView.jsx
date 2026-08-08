import { useState, useEffect } from "react";
import { Paperclip } from "lucide-react";
import {
  STATUSES, STATUS_META, TYPE_TAGS, priorityMeta, countryFlag, formatDateTime,
  SURFACE_ROW, SURFACE_RAISED, SURFACE_CHIP, SURFACE_2, BORDER_ROW, BORDER_CHIP, BORDER_INPUT,
  TEXT, TEXT_MUTED, TEXT_QUIET, TEXT_QUIETEST, LIME, BG, LINE_FILLER, FONT_MONO, FONT_UI,
} from "../lib/constants";

const PAGE_SIZE = 10;

function initials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function GroupPagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: "6px", padding: "10px 0 2px" }}>
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        style={{
          padding: "5px 10px", borderRadius: "6px", border: `1px solid ${BORDER_CHIP}`,
          background: SURFACE_2, color: page === 1 ? TEXT_QUIETEST : TEXT_MUTED,
          cursor: page === 1 ? "default" : "pointer", fontFamily: FONT_MONO, fontSize: "11px",
        }}
      >
        ←
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          style={{
            padding: "5px 10px", borderRadius: "6px", border: `1px solid ${p === page ? LIME : BORDER_CHIP}`,
            background: p === page ? LIME : SURFACE_2, color: p === page ? BG : TEXT_MUTED,
            cursor: "pointer", fontFamily: FONT_MONO, fontSize: "11px", fontWeight: p === page ? 700 : 400,
          }}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        style={{
          padding: "5px 10px", borderRadius: "6px", border: `1px solid ${BORDER_CHIP}`,
          background: SURFACE_2, color: page === totalPages ? TEXT_QUIETEST : TEXT_MUTED,
          cursor: page === totalPages ? "default" : "pointer", fontFamily: FONT_MONO, fontSize: "11px",
        }}
      >
        →
      </button>
    </div>
  );
}

const gridCols = "104px minmax(220px,1fr) 120px 130px 112px";

export default function TaskListView({ tasks, onOpen }) {
  const [pages, setPages] = useState({});

  const groups = STATUSES.map((status) => ({
    status,
    items: tasks.filter((t) => t.status === status),
  })).filter((g) => g.items.length > 0);

  // reset pages when the underlying task set changes shape (filters/search) to avoid landing on an empty page
  const groupKey = groups.map((g) => `${g.status}:${g.items.length}`).join("|");
  useEffect(() => {
    setPages({});
  }, [groupKey]);

  if (tasks.length === 0) {
    return (
      <div style={{ padding: "0 24px 32px" }}>
        <div style={{ border: `1px dashed ${BORDER_INPUT}`, borderRadius: "12px", padding: "36px", textAlign: "center", marginTop: "8px" }}>
          <div style={{ fontFamily: FONT_UI, fontWeight: 600, fontSize: "14px", color: TEXT_MUTED }}>Ничего не найдено</div>
          <div style={{ fontSize: "12.5px", color: TEXT_QUIET, marginTop: "4px" }}>Сбросьте поиск или фильтр по баеру</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "0 24px 32px", overflowX: "auto" }}>
      <div style={{ minWidth: "1000px", display: "grid", gridTemplateColumns: gridCols, gap: "14px", padding: "0 14px 8px", fontFamily: FONT_MONO, fontSize: "9.5px", letterSpacing: ".14em", color: TEXT_QUIETEST, whiteSpace: "nowrap" }}>
        <div>СОЗДАНА</div><div>ЗАДАЧА</div><div>ГЕО</div><div>ИСПОЛНИТЕЛЬ</div><div>СТАТУС</div>
      </div>

      <div style={{ minWidth: "1000px", display: "flex", flexDirection: "column", gap: "14px" }}>
        {groups.map((g) => {
          const meta = STATUS_META[g.status];
          const totalPages = Math.max(1, Math.ceil(g.items.length / PAGE_SIZE));
          const page = Math.min(pages[g.status] || 1, totalPages);
          const pagedItems = g.items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
          return (
            <div key={g.status}>
              <div style={{ display: "flex", alignItems: "center", gap: "9px", padding: "0 14px 7px" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "2px", background: meta.marker }} />
                <span style={{ fontFamily: FONT_MONO, fontSize: "10px", letterSpacing: ".14em", color: TEXT_MUTED }}>{g.status.toUpperCase()}</span>
                <span style={{ fontFamily: FONT_MONO, fontSize: "10px", color: TEXT_QUIETEST }}>{g.items.length}</span>
                <span style={{ flex: 1, height: "1px", background: LINE_FILLER }} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {pagedItems.map((task) => {
                  const pm = priorityMeta(task.priority);
                  const sm = STATUS_META[task.status];
                  const assigned = !!task.assigned_designer;
                  return (
                    <div
                      key={task.id}
                      onClick={() => onOpen(task)}
                      className="task-row"
                      style={{
                        position: "relative", display: "grid", gridTemplateColumns: gridCols, gap: "14px",
                        alignItems: "center", padding: "11px 14px 11px 18px",
                        background: SURFACE_ROW, border: `1px solid ${BORDER_ROW}`, borderRadius: "10px", cursor: "pointer",
                      }}
                    >
                      <div style={{ position: "absolute", left: 0, top: "9px", bottom: "9px", width: "2px", borderRadius: "2px", background: sm.marker }} />

                      <div style={{ fontFamily: FONT_MONO, fontSize: "11.5px", color: TEXT_QUIET, whiteSpace: "nowrap" }}>
                        {formatDateTime(new Date(task.created_at))}
                      </div>

                      <div style={{ minWidth: 0, display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontFamily: FONT_MONO, fontSize: "10px", color: TEXT_QUIET, background: SURFACE_CHIP, border: `1px solid ${BORDER_CHIP}`, borderRadius: "5px", padding: "2px 6px", flexShrink: 0 }}>
                          DES-{String(task.id).padStart(3, "0")}
                        </span>
                        <span style={{ fontFamily: FONT_UI, fontSize: "14px", fontWeight: 600, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {task.title}
                        </span>
                        <span style={{ fontFamily: FONT_MONO, fontSize: "9px", letterSpacing: ".12em", color: TEXT_QUIET, border: `1px solid ${BORDER_CHIP}`, borderRadius: "4px", padding: "2px 5px", flexShrink: 0 }}>
                          {TYPE_TAGS[task.type] || task.type}
                        </span>
                        {task.creative_link && (
                          <span title="Есть креатив" style={{ display: "inline-flex", color: TEXT_QUIET, flexShrink: 0 }}>
                            <Paperclip size={12} />
                          </span>
                        )}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "8px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "15px" }}>{countryFlag(task.geo)}</span>
                        <span style={{ fontFamily: FONT_UI, fontSize: "12.5px", color: TEXT_MUTED, overflow: "hidden", textOverflow: "ellipsis" }}>
                          {task.geo}
                        </span>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
                        <span style={{ fontFamily: FONT_UI, fontSize: "12.5px", color: assigned ? TEXT : TEXT_QUIET, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {task.assigned_designer || "не назначен"}
                        </span>
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: "6px", fontFamily: FONT_MONO, fontSize: "10px",
                          letterSpacing: ".1em", padding: "4px 9px", borderRadius: "6px",
                          color: sm.color, background: sm.bg, border: `1px solid ${sm.border}`, whiteSpace: "nowrap",
                        }}>
                          {task.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <GroupPagination
                page={page}
                totalPages={totalPages}
                onChange={(p) => setPages((prev) => ({ ...prev, [g.status]: p }))}
              />
            </div>
          );
        })}
      </div>

      <style>{`.task-row:hover { background: #141710 !important; border-color: #2b3122 !important; }`}</style>
    </div>
  );
}
