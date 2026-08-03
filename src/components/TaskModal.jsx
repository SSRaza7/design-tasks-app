import { useState } from "react";
import { X, Trash2, Link2, Paperclip, Eye, Download, UploadCloud } from "lucide-react";
import { Field, Row } from "./Field";
import SearchableSelect from "./SearchableSelect";
import { supabase } from "../lib/supabaseClient";
import {
  TYPES, FORMATS, PRIORITIES, STATUSES, COUNTRIES, LANGUAGES,
  LIME, BG, SURFACE, SURFACE_2, BORDER, TEXT, TEXT_MUTED,
  inputStyle, mediaType,
} from "../lib/constants";

const fontStack = "'Space Grotesk', 'Inter', sans-serif";

export default function TaskModal({ modal, setModal, role, onClose, onSave, onDelete, celebsByGeo }) {
  const [celebInput, setCelebInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const lockedForRole = role === "designer";
  const draft = modal.draft;

  const suggestedCelebs = (celebsByGeo[draft.geo] || []).filter(
    (c) => !draft.celebs.some((added) => added.toLowerCase() === c.toLowerCase())
  );

  function update(patch) {
    setModal((m) => ({ ...m, draft: { ...m.draft, ...patch } }));
  }

  function toggleFormat(f) {
    const has = draft.format.includes(f);
    update({ format: has ? draft.format.filter((x) => x !== f) : [...draft.format, f] });
  }

  function addCeleb(name) {
    const clean = name.trim();
    if (!clean) return;
    if (draft.celebs.some((c) => c.toLowerCase() === clean.toLowerCase())) return;
    update({ celebs: [...draft.celebs, clean] });
    setCelebInput("");
  }
  function removeCeleb(name) {
    update({ celebs: draft.celebs.filter((c) => c !== name) });
  }

  async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    const path = `${modal.editingId || "new"}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("creatives").upload(path, file, { upsert: true });
    if (error) {
      setUploadError(error.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("creatives").getPublicUrl(path);
    update({ creativeLink: data.publicUrl });
    setUploading(false);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "20px" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "14px", width: "100%", maxWidth: "540px", maxHeight: "88vh", overflowY: "auto", padding: "22px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div style={{ fontFamily: fontStack, fontWeight: 600, fontSize: "17px", color: TEXT }}>
            {modal.mode === "new" ? "Новая задача" : `Задача ${modal.editingId}`}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: TEXT_MUTED }}>
            <X size={18} />
          </button>
        </div>

        <Field label="Название">
          <input autoFocus disabled={lockedForRole} value={draft.title} onChange={(e) => update({ title: e.target.value })} placeholder="Например: Баннеры для email-рассылки" style={{ ...inputStyle, opacity: lockedForRole ? 0.7 : 1 }} />
        </Field>

        <Row>
          <Field label="Тип задачи">
            <select disabled={lockedForRole} value={draft.type} onChange={(e) => update({ type: e.target.value })} style={{ ...inputStyle, opacity: lockedForRole ? 0.7 : 1 }}>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Приоритет">
            <select disabled={lockedForRole} value={draft.priority} onChange={(e) => update({ priority: e.target.value })} style={{ ...inputStyle, opacity: lockedForRole ? 0.7 : 1 }}>
              {PRIORITIES.map((p) => <option key={p.label} value={p.label}>{p.label}</option>)}
            </select>
          </Field>
        </Row>

        {modal.mode === "edit" && role === "designer" && (
          <Field label="Статус">
            <select value={draft.status} onChange={(e) => update({ status: e.target.value })} style={inputStyle}>
              {STATUSES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
        )}

        <Field label="Формат">
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {FORMATS.map((f) => {
              const active = draft.format.includes(f);
              return (
                <button
                  key={f}
                  type="button"
                  disabled={lockedForRole}
                  onClick={() => toggleFormat(f)}
                  style={{
                    padding: "7px 12px", borderRadius: "7px", fontSize: "13px", cursor: lockedForRole ? "default" : "pointer",
                    border: `1px solid ${active ? LIME : BORDER}`,
                    background: active ? LIME : SURFACE_2,
                    color: active ? BG : TEXT,
                    fontWeight: active ? 600 : 400,
                    opacity: lockedForRole ? 0.7 : 1,
                  }}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </Field>

        <Row>
          <Field label="Гео">
            <SearchableSelect options={COUNTRIES} value={draft.geo} onChange={(v) => update({ geo: v })} placeholder="Поиск страны" disabled={lockedForRole} />
          </Field>
          <Field label="Язык">
            <SearchableSelect options={LANGUAGES} value={draft.language} onChange={(v) => update({ language: v })} placeholder="Поиск языка" disabled={lockedForRole} />
          </Field>
        </Row>

        <Field label="Селебы">
          {!lockedForRole && (
            <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
              <input
                value={celebInput}
                onChange={(e) => setCelebInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCeleb(celebInput); } }}
                placeholder="Введите имя и нажмите Enter"
                style={inputStyle}
              />
              <button type="button" onClick={() => addCeleb(celebInput)} style={{ padding: "8px 12px", borderRadius: "7px", border: `1px solid ${BORDER}`, background: SURFACE_2, color: TEXT, cursor: "pointer", fontSize: "13px", whiteSpace: "nowrap" }}>
                Добавить
              </button>
            </div>
          )}

          {draft.celebs.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
              {draft.celebs.map((c) => (
                <span key={c} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", fontWeight: 500, color: BG, background: LIME, borderRadius: "6px", padding: "3px 8px" }}>
                  + {c}
                  {!lockedForRole && <X size={11} style={{ cursor: "pointer" }} onClick={() => removeCeleb(c)} />}
                </span>
              ))}
            </div>
          )}

          {!lockedForRole && suggestedCelebs.length > 0 && (
            <div>
              <div style={{ fontSize: "11px", color: TEXT_MUTED, marginBottom: "5px" }}>Уже использовались для «{draft.geo}»:</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {suggestedCelebs.map((c) => (
                  <button key={c} type="button" onClick={() => addCeleb(c)} style={{ fontSize: "12px", color: TEXT_MUTED, background: "transparent", border: `1px dashed ${BORDER}`, borderRadius: "6px", padding: "3px 8px", cursor: "pointer" }}>
                    + {c}
                  </button>
                ))}
              </div>
            </div>
          )}
        </Field>

        <Field label="Описание">
          <textarea disabled={lockedForRole} value={draft.description} onChange={(e) => update({ description: e.target.value })} placeholder="Что нужно сделать, стиль, ограничения, цветовая гамма..." rows={4} style={{ ...inputStyle, resize: "vertical", fontFamily: "'Inter', sans-serif", opacity: lockedForRole ? 0.7 : 1 }} />
        </Field>

        <Field label={<span style={{ display: "flex", alignItems: "center", gap: "5px" }}><Link2 size={12} /> Ссылка на задачу</span>}>
          <input disabled={lockedForRole} value={draft.taskLink} onChange={(e) => update({ taskLink: e.target.value })} placeholder="Ссылка на задачу, бриф или трекер" style={{ ...inputStyle, opacity: lockedForRole ? 0.7 : 1 }} />
        </Field>

        {modal.mode === "edit" && (
          <Field label={<span style={{ display: "flex", alignItems: "center", gap: "5px" }}><Paperclip size={12} /> Креатив</span>}>
            {role === "designer" && (
              <>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 12px", borderRadius: "7px", border: `1px dashed ${BORDER}`, cursor: "pointer", fontSize: "13px", color: TEXT_MUTED }}>
                  <UploadCloud size={15} />
                  {uploading ? "Загрузка..." : "Загрузить файл в хранилище"}
                  <input type="file" accept="video/*,image/*" onChange={handleFileUpload} disabled={uploading} style={{ display: "none" }} />
                </label>
                {uploadError && <div style={{ color: "#E85D3D", fontSize: "12px", marginTop: "6px" }}>{uploadError}</div>}
                <div style={{ fontSize: "10.5px", color: TEXT_MUTED, margin: "8px 0" }}>Или вставьте готовую ссылку:</div>
                <input value={draft.creativeLink} onChange={(e) => update({ creativeLink: e.target.value })} placeholder="Ссылка на готовый креатив" style={inputStyle} />
              </>
            )}

            {role === "buyer" && (
              <div>
                {draft.creativeLink ? (
                  <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                    <a href={draft.creativeLink} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: TEXT, border: `1px solid ${BORDER}`, borderRadius: "7px", padding: "7px 12px", textDecoration: "none" }}>
                      <Eye size={14} /> Просмотреть
                    </a>
                    {draft.status === "Готово" ? (
                      <a href={draft.creativeLink} target="_blank" rel="noreferrer" download style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", fontWeight: 600, color: BG, background: LIME, borderRadius: "7px", padding: "7px 12px", textDecoration: "none" }}>
                        <Download size={14} /> Скачать
                      </a>
                    ) : (
                      <span style={{ fontSize: "12px", color: TEXT_MUTED }}>Скачивание откроется после утверждения задачи</span>
                    )}
                  </div>
                ) : (
                  <div style={{ fontSize: "12.5px", color: TEXT_MUTED }}>Дизайнер ещё не прикрепил креатив</div>
                )}
              </div>
            )}

            {draft.creativeLink && mediaType(draft.creativeLink) === "video" && (
              <video src={draft.creativeLink} controls style={{ width: "100%", maxHeight: "260px", borderRadius: "8px", marginTop: "10px" }} />
            )}
            {draft.creativeLink && mediaType(draft.creativeLink) === "image" && (
              <img src={draft.creativeLink} alt="Предпросмотр креатива" style={{ width: "100%", maxHeight: "260px", objectFit: "contain", borderRadius: "8px", marginTop: "10px" }} />
            )}
          </Field>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "18px" }}>
          {modal.mode === "edit" && role === "buyer" ? (
            <button onClick={() => onDelete(modal.editingId)} style={{ display: "flex", alignItems: "center", gap: "5px", background: "none", border: "none", color: "#E85D3D", cursor: "pointer", fontSize: "13px" }}>
              <Trash2 size={14} /> Удалить
            </button>
          ) : <span />}
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={onClose} style={{ padding: "9px 14px", borderRadius: "8px", border: `1px solid ${BORDER}`, background: "transparent", color: TEXT, cursor: "pointer", fontSize: "13px" }}>
              Отмена
            </button>
            <button onClick={() => onSave(draft)} style={{ padding: "9px 16px", borderRadius: "8px", border: "none", background: LIME, color: BG, cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>
              Сохранить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
