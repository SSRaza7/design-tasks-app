import { useState, useEffect, useRef } from "react";
import { X, Link2, Paperclip, Eye, Download, UploadCloud, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import {
  STATUSES, STATUS_META, priorityMeta, countryFlag, formatDateTime, mediaType,
  BG, SURFACE, SURFACE_2, SURFACE_CHIP, BORDER, BORDER_INPUT, BORDER_CHIP,
  TEXT, TEXT_SECONDARY, TEXT_MUTED, TEXT_DESC, TEXT_QUIET, TEXT_QUIETEST, LIME,
  FONT_MONO, FONT_UI,
} from "../lib/constants";

function nextActionLabel(status) {
  if (status === "Ожидание") return "Взять в работу";
  if (status === "В работе") return "Отправить на ревью";
  if (status === "На ревью") return "Готово";
  return null;
}

function MetaCell({ label, value }) {
  return (
    <div style={{ background: SURFACE_2, padding: "11px 13px" }}>
      <div style={{ fontFamily: FONT_MONO, fontSize: "9px", letterSpacing: ".14em", color: TEXT_QUIETEST }}>{label}</div>
      <div style={{ fontFamily: FONT_UI, fontWeight: 600, fontSize: "13px", color: TEXT, marginTop: "5px" }}>{value || "—"}</div>
    </div>
  );
}

export default function TaskPanel({ task, role, onClose, onTakeIntoWork, onAdvance, onDelete, onSaveCreative, onRequestChanges }) {
  const [showRevision, setShowRevision] = useState(false);
  const [revisionText, setRevisionText] = useState("");
  const [creativeInput, setCreativeInput] = useState(task.creative_link || "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSeconds, setUploadSeconds] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => () => clearInterval(timerRef.current), []);

  if (!task) return null;
  const sm = STATUS_META[task.status];
  const canTake = role === "designer" && task.status === "Ожидание" && !task.assigned_designer_id;
  const canAdvanceDesigner = role === "designer" && task.status !== "Ожидание" && task.status !== "Готово";
  const canApprove = role === "buyer" && task.status === "На ревью";
  const next = nextActionLabel(task.status);

  const history = [
    { text: "Задача создана", time: formatDateTime(new Date(task.created_at)) },
    task.assigned_designer && { text: `Исполнитель: ${task.assigned_designer}`, time: task.status_updated_at ? formatDateTime(new Date(task.status_updated_at)) : "" },
    task.status !== "Ожидание" && task.status_updated_at && { text: `Текущий статус: ${task.status}`, time: formatDateTime(new Date(task.status_updated_at)) },
  ].filter(Boolean);

  async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    setUploadSeconds(0);
    timerRef.current = setInterval(() => setUploadSeconds((s) => s + 1), 1000);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${task.id}/${Date.now()}-${safeName}`;
    const { error } = await supabase.storage.from("creatives").upload(path, file, { upsert: true });
    clearInterval(timerRef.current);
    if (error) {
      setUploadError(error.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("creatives").getPublicUrl(path);
    setCreativeInput(data.publicUrl);
    onSaveCreative(task.id, data.publicUrl);
    setUploading(false);
  }

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(5,6,5,.6)", zIndex: 20 }} />
      <div
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0, width: "392px", zIndex: 21,
          background: SURFACE, borderLeft: `1px solid ${BORDER_INPUT}`,
          boxShadow: "-30px 0 60px -20px rgba(0,0,0,.8)",
          display: "flex", flexDirection: "column",
        }}
      >
        <div style={{ padding: "16px 18px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: "10px", color: TEXT_QUIET, background: SURFACE_CHIP, border: `1px solid ${BORDER_CHIP}`, borderRadius: "5px", padding: "3px 7px" }}>
            DES-{String(task.id).padStart(3, "0")}
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", fontFamily: FONT_MONO, fontSize: "10px", letterSpacing: ".1em", padding: "4px 9px", borderRadius: "6px", color: sm.color, background: sm.bg, border: `1px solid ${sm.border}` }}>
            {task.status.toUpperCase()}
          </span>
          <button onClick={onClose} style={{ marginLeft: "auto", width: "28px", height: "28px", border: "none", borderRadius: "8px", background: "transparent", color: TEXT_QUIET, cursor: "pointer", display: "grid", placeItems: "center" }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "18px", overflow: "auto" }}>
          <div>
            <div style={{ fontFamily: FONT_UI, fontWeight: 800, fontSize: "19px", letterSpacing: "-.02em", lineHeight: 1.25, color: TEXT }}>
              {task.title}
            </div>
            {task.description && (
              <div style={{ fontSize: "13px", color: TEXT_DESC, lineHeight: 1.6, marginTop: "8px" }}>{task.description}</div>
            )}
          </div>

          {task.revision_note && (
            <div style={{ background: "rgba(240,111,111,.08)", border: "1px solid rgba(240,111,111,.28)", borderRadius: "10px", padding: "11px 13px" }}>
              <div style={{ fontFamily: FONT_MONO, fontSize: "9px", letterSpacing: ".14em", color: "#f06f6f", marginBottom: "5px" }}>ПРАВКИ ОТ БАЕРА</div>
              <div style={{ fontSize: "12.5px", color: TEXT_SECONDARY, lineHeight: 1.5 }}>{task.revision_note}</div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: BORDER, borderRadius: "10px", overflow: "hidden" }}>
            <MetaCell label="ГЕО" value={task.geo ? `${countryFlag(task.geo)} ${task.geo}` : "—"} />
            <MetaCell label="ЯЗЫК" value={task.language} />
            <MetaCell label="ФОРМАТ" value={(task.format || []).join(", ")} />
            <MetaCell label="ПРИОРИТЕТ" value={task.priority} />
            <MetaCell label="ПОСТАНОВЩИК" value={task.posted_by} />
            <MetaCell label="ИСПОЛНИТЕЛЬ" value={task.assigned_designer} />
          </div>

          {(task.celebs || []).length > 0 && (
            <div>
              <div style={{ fontFamily: FONT_MONO, fontSize: "9.5px", letterSpacing: ".14em", color: TEXT_QUIETEST, marginBottom: "9px" }}>СЕЛЕБЫ</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {task.celebs.map((c) => (
                  <span key={c} style={{ fontFamily: FONT_UI, fontSize: "12px", fontWeight: 600, padding: "5px 9px", borderRadius: "7px", background: "rgba(200,247,81,.1)", border: "1px solid rgba(200,247,81,.28)", color: LIME }}>
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {task.task_link && (
            <div>
              <div style={{ fontFamily: FONT_MONO, fontSize: "9.5px", letterSpacing: ".14em", color: TEXT_QUIETEST, marginBottom: "9px", display: "flex", alignItems: "center", gap: "5px" }}>
                <Link2 size={11} /> ССЫЛКА НА ЗАДАЧУ
              </div>
              <a href={task.task_link} target="_blank" rel="noreferrer" style={{ fontSize: "13px", color: LIME, wordBreak: "break-all" }}>
                {task.task_link}
              </a>
            </div>
          )}

          <div>
            <div style={{ fontFamily: FONT_MONO, fontSize: "9.5px", letterSpacing: ".14em", color: TEXT_QUIETEST, marginBottom: "9px", display: "flex", alignItems: "center", gap: "5px" }}>
              <Paperclip size={11} /> КРЕАТИВ
            </div>

            {role === "designer" && (
              <>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 12px", borderRadius: "9px", border: `1px dashed ${BORDER_INPUT}`, cursor: "pointer", fontSize: "13px", color: TEXT_QUIET, marginBottom: "8px" }}>
                  <UploadCloud size={15} />
                  {uploading ? `Загрузка... ${uploadSeconds} сек` : "Загрузить файл"}
                  <input type="file" accept="video/*,image/*" onChange={handleFileUpload} disabled={uploading} style={{ display: "none" }} />
                </label>
                {uploadError && <div style={{ color: "#f06f6f", fontSize: "12px", marginBottom: "8px" }}>{uploadError}</div>}
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    value={creativeInput}
                    onChange={(e) => setCreativeInput(e.target.value)}
                    placeholder="Или вставьте ссылку"
                    style={{ flex: 1, boxSizing: "border-box", padding: "9px 11px", borderRadius: "8px", border: `1px solid ${BORDER_INPUT}`, background: SURFACE_2, fontSize: "12.5px", color: TEXT, outline: "none" }}
                  />
                  <button
                    onClick={() => onSaveCreative(task.id, creativeInput)}
                    style={{ padding: "0 14px", borderRadius: "8px", border: "none", background: LIME, color: BG, fontWeight: 700, fontSize: "12.5px", cursor: "pointer" }}
                  >
                    OK
                  </button>
                </div>
              </>
            )}

            {role === "buyer" && (
              task.creative_link ? (
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <a href={task.creative_link} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12.5px", color: TEXT, border: `1px solid ${BORDER_INPUT}`, borderRadius: "8px", padding: "7px 12px" }}>
                    <Eye size={13} /> Просмотреть
                  </a>
                  {task.status === "Готово" ? (
                    <a href={task.creative_link} target="_blank" rel="noreferrer" download style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12.5px", fontWeight: 700, color: BG, background: LIME, borderRadius: "8px", padding: "7px 12px" }}>
                      <Download size={13} /> Скачать
                    </a>
                  ) : (
                    <span style={{ fontSize: "12px", color: TEXT_QUIET, alignSelf: "center" }}>Скачивание после утверждения</span>
                  )}
                </div>
              ) : (
                <div style={{ fontSize: "12.5px", color: TEXT_QUIET }}>Дизайнер ещё не прикрепил креатив</div>
              )
            )}

            {task.creative_link && mediaType(task.creative_link) === "video" && (
              <video src={task.creative_link} controls style={{ width: "100%", maxHeight: "220px", borderRadius: "8px", marginTop: "10px" }} />
            )}
            {task.creative_link && mediaType(task.creative_link) === "image" && (
              <img src={task.creative_link} alt="" style={{ width: "100%", maxHeight: "220px", objectFit: "contain", borderRadius: "8px", marginTop: "10px" }} />
            )}
          </div>

          {canTake && (
            <button
              onClick={() => onTakeIntoWork(task)}
              style={{ width: "100%", height: "38px", border: "none", borderRadius: "10px", background: LIME, color: BG, fontFamily: FONT_UI, fontWeight: 700, fontSize: "13.5px", cursor: "pointer", boxShadow: "0 6px 18px -8px rgba(200,247,81,.6)" }}
            >
              Взять в работу
            </button>
          )}

          {(canAdvanceDesigner || canApprove) && next && (
            <div>
              <div style={{ fontFamily: FONT_MONO, fontSize: "9.5px", letterSpacing: ".14em", color: TEXT_QUIETEST, marginBottom: "9px" }}>ПЕРЕВЕСТИ В</div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button
                  onClick={() => onAdvance(task)}
                  style={{ fontFamily: FONT_UI, fontWeight: 600, fontSize: "12.5px", padding: "7px 12px", borderRadius: "8px", background: SURFACE_CHIP, border: `1px solid ${BORDER_CHIP}`, color: TEXT_SECONDARY, cursor: "pointer" }}
                >
                  {canApprove ? "Готово (утвердить)" : next}
                </button>
                {canApprove && (
                  <button
                    onClick={() => setShowRevision((v) => !v)}
                    style={{ fontFamily: FONT_UI, fontWeight: 600, fontSize: "12.5px", padding: "7px 12px", borderRadius: "8px", background: "transparent", border: `1px dashed ${BORDER_INPUT}`, color: TEXT_QUIET, cursor: "pointer" }}
                  >
                    Редактировать
                  </button>
                )}
              </div>

              {canApprove && showRevision && (
                <div style={{ marginTop: "10px" }}>
                  <textarea
                    value={revisionText}
                    onChange={(e) => setRevisionText(e.target.value)}
                    placeholder="Что нужно поправить..."
                    style={{
                      width: "100%", boxSizing: "border-box", height: "72px", resize: "none",
                      padding: "9px 11px", borderRadius: "8px", border: `1px solid ${BORDER_INPUT}`,
                      background: SURFACE_2, fontFamily: FONT_UI, fontSize: "12.5px", color: TEXT, outline: "none",
                    }}
                  />
                  <button
                    onClick={() => {
                      if (!revisionText.trim()) return;
                      onRequestChanges(task, revisionText.trim());
                      setShowRevision(false);
                      setRevisionText("");
                    }}
                    style={{
                      marginTop: "8px", width: "100%", height: "34px", border: "none", borderRadius: "8px",
                      background: LIME, color: BG, fontFamily: FONT_UI, fontWeight: 700, fontSize: "12.5px", cursor: "pointer",
                    }}
                  >
                    Отправить на доработку
                  </button>
                </div>
              )}
            </div>
          )}

          {history.length > 0 && (
            <div>
              <div style={{ fontFamily: FONT_MONO, fontSize: "9.5px", letterSpacing: ".14em", color: TEXT_QUIETEST, marginBottom: "11px" }}>ИСТОРИЯ</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
                {history.map((h, i) => (
                  <div key={i} style={{ display: "flex", gap: "9px" }}>
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#39412c", marginTop: "6px", flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: "12.5px", color: TEXT_SECONDARY }}>{h.text}</div>
                      {h.time && <div style={{ fontFamily: FONT_MONO, fontSize: "10px", color: TEXT_QUIETEST, marginTop: "2px" }}>{h.time}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {role === "buyer" && (
            <button
              onClick={() => onDelete(task.id)}
              style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: "#f06f6f", cursor: "pointer", fontSize: "12.5px", padding: 0, alignSelf: "flex-start" }}
            >
              <Trash2 size={13} /> Удалить задачу
            </button>
          )}
        </div>
      </div>
    </>
  );
}
