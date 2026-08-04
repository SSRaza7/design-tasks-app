import { useState } from "react";
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
    const path = `${task.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("creatives").upload(path, file, { upsert: true });
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
