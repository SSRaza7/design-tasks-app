import { useState } from "react";
import { X, Link2 } from "lucide-react";
import SearchableSelect from "./SearchableSelect";
import {
  TYPES, FORMATS, PRIORITIES, COUNTRIES, LANGUAGES,
  BG, SURFACE, SURFACE_2, SURFACE_CHIP, BORDER, BORDER_INPUT, BORDER_CHIP,
  TEXT, TEXT_SECONDARY, TEXT_QUIET, TEXT_QUIETEST, LIME,
  FONT_MONO, FONT_UI,
} from "../lib/constants";

const emptyDraft = {
  title: "", type: TYPES[0], priority: "Средний", format: ["4:5"],
  geo: COUNTRIES[0], language: LANGUAGES[0], celebs: [],
  description: "", taskLink: "",
};

const fieldLabelStyle = { fontFamily: FONT_MONO, fontSize: "9.5px", letterSpacing: ".14em", color: TEXT_QUIETEST, marginBottom: "7px" };
const fieldStyle = {
  width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "9px",
  border: `1px solid ${BORDER_INPUT}`, background: SURFACE_2, fontFamily: FONT_UI,
  fontSize: "13.5px", color: TEXT, outline: "none",
};

function pillStyle(active) {
  return {
    fontFamily: FONT_MONO, fontSize: "10.5px", letterSpacing: ".06em", padding: "6px 9px", borderRadius: "7px",
    cursor: "pointer", border: `1px solid ${active ? "rgba(200,247,81,.4)" : BORDER_INPUT}`,
    background: active ? "rgba(200,247,81,.12)" : SURFACE_2, color: active ? LIME : "#7c8470",
  };
}

export default function NewTaskModal({ nextId, celebsByGeo, onClose, onCreate }) {
  const [draft, setDraft] = useState({ ...emptyDraft });
  const [celebInput, setCelebInput] = useState("");

  function update(patch) {
    setDraft((d) => ({ ...d, ...patch }));
  }
  function toggleFormat(f) {
    const has = draft.format.includes(f);
    update({ format: has ? draft.format.filter((x) => x !== f) : [...draft.format, f] });
  }
  function addCeleb(name) {
    const clean = name.trim();
    if (!clean || draft.celebs.some((c) => c.toLowerCase() === clean.toLowerCase())) return;
    update({ celebs: [...draft.celebs, clean] });
    setCelebInput("");
  }
  function removeCeleb(name) {
    update({ celebs: draft.celebs.filter((c) => c !== name) });
  }

  const suggestedCelebs = (celebsByGeo[draft.geo] || []).filter(
    (c) => !draft.celebs.some((added) => added.toLowerCase() === c.toLowerCase())
  );

  const valid = draft.title.trim().length > 0;

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(5,6,5,.68)", backdropFilter: "blur(3px)", zIndex: 30 }} />
      <div style={{ position: "fixed", top: "8vh", left: "50%", transform: "translateX(-50%)", width: "520px", maxWidth: "92vw", zIndex: 31, background: SURFACE, border: `1px solid ${BORDER_INPUT}`, borderRadius: "14px", boxShadow: "0 40px 80px -20px rgba(0,0,0,.85)" }}>
        <div style={{ padding: "16px 18px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontFamily: FONT_UI, fontWeight: 800, fontSize: "16px", letterSpacing: "-.02em", color: TEXT }}>Новая задача</span>
          <span style={{ fontFamily: FONT_MONO, fontSize: "10px", color: TEXT_QUIET, background: SURFACE_CHIP, border: `1px solid ${BORDER_CHIP}`, borderRadius: "5px", padding: "3px 7px" }}>
            DES-{String(nextId).padStart(3, "0")}
          </span>
          <button onClick={onClose} style={{ marginLeft: "auto", width: "28px", height: "28px", border: "none", borderRadius: "8px", background: "transparent", color: TEXT_QUIET, cursor: "pointer", display: "grid", placeItems: "center" }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "15px", maxHeight: "64vh", overflowY: "auto" }}>
          <div>
            <div style={fieldLabelStyle}>НАЗВАНИЕ</div>
            <input autoFocus value={draft.title} onChange={(e) => update({ title: e.target.value })} placeholder="Например: баннеры для email-рассылки" style={fieldStyle} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <div style={fieldLabelStyle}>ТИП ЗАДАЧИ</div>
              <select value={draft.type} onChange={(e) => update({ type: e.target.value })} style={fieldStyle}>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <div style={fieldLabelStyle}>ПРИОРИТЕТ</div>
              <div style={{ display: "flex", gap: "6px" }}>
                {PRIORITIES.map((p) => (
                  <button key={p.label} type="button" onClick={() => update({ priority: p.label })} style={pillStyle(draft.priority === p.label)}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div style={fieldLabelStyle}>ФОРМАТ</div>
            <div style={{ display: "flex", gap: "6px" }}>
              {FORMATS.map((f) => (
                <button key={f} type="button" onClick={() => toggleFormat(f)} style={pillStyle(draft.format.includes(f))}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <div style={fieldLabelStyle}>ГЕО</div>
              <SearchableSelect options={COUNTRIES} value={draft.geo} onChange={(v) => update({ geo: v })} placeholder="Поиск страны" />
            </div>
            <div>
              <div style={fieldLabelStyle}>ЯЗЫК</div>
              <SearchableSelect options={LANGUAGES} value={draft.language} onChange={(v) => update({ language: v })} placeholder="Поиск языка" />
            </div>
          </div>

          <div>
            <div style={fieldLabelStyle}>СЕЛЕБЫ</div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
              <input
                value={celebInput}
                onChange={(e) => setCelebInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCeleb(celebInput); } }}
                placeholder="Введите имя и нажмите Enter"
                style={fieldStyle}
              />
              <button type="button" onClick={() => addCeleb(celebInput)} style={{ padding: "0 14px", borderRadius: "9px", border: `1px solid ${BORDER_INPUT}`, background: SURFACE_CHIP, color: TEXT_SECONDARY, fontFamily: FONT_UI, fontWeight: 600, fontSize: "13px", cursor: "pointer", whiteSpace: "nowrap" }}>
                Добавить
              </button>
            </div>
            {draft.celebs.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "8px" }}>
                {draft.celebs.map((c) => (
                  <span key={c} style={{ display: "flex", alignItems: "center", gap: "5px", fontFamily: FONT_UI, fontWeight: 600, fontSize: "12px", padding: "5px 9px", borderRadius: "7px", background: "rgba(200,247,81,.1)", border: "1px solid rgba(200,247,81,.28)", color: LIME }}>
                    {c}
                    <span onClick={() => removeCeleb(c)} style={{ cursor: "pointer", color: "#8ba53c" }}>×</span>
                  </span>
                ))}
              </div>
            )}
            {suggestedCelebs.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {suggestedCelebs.map((c) => (
                  <button key={c} type="button" onClick={() => addCeleb(c)} style={{ fontFamily: FONT_UI, fontSize: "12px", color: TEXT_QUIET, background: "transparent", border: `1px dashed ${BORDER_INPUT}`, borderRadius: "6px", padding: "3px 8px", cursor: "pointer" }}>
                    + {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div style={fieldLabelStyle}>ОПИСАНИЕ</div>
            <textarea
              value={draft.description}
              onChange={(e) => update({ description: e.target.value })}
              placeholder="Что нужно сделать, стиль, ограничения, цветовая гамма..."
              style={{ ...fieldStyle, height: "86px", resize: "none", fontSize: "13px", lineHeight: 1.5 }}
            />
          </div>

          <div>
            <div style={{ ...fieldLabelStyle, display: "flex", alignItems: "center", gap: "5px" }}><Link2 size={11} /> ССЫЛКА НА ЗАДАЧУ</div>
            <input value={draft.taskLink} onChange={(e) => update({ taskLink: e.target.value })} placeholder="Ссылка на задачу, бриф или трекер" style={fieldStyle} />
          </div>
        </div>

        <div style={{ padding: "14px 18px", borderTop: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: "9px" }}>
          <span style={{ fontSize: "12px", color: TEXT_QUIET, flex: 1 }}>
            {valid ? "Попадёт в «Ожидание» — исполнитель возьмёт сам" : "Заполните название"}
          </span>
          <button onClick={onClose} style={{ height: "34px", padding: "0 14px", background: "transparent", border: `1px solid ${BORDER_INPUT}`, borderRadius: "9px", color: "#a8b09a", fontFamily: FONT_UI, fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>
            Отмена
          </button>
          <button
            onClick={() => valid && onCreate(draft)}
            disabled={!valid}
            style={{
              height: "34px", padding: "0 16px", borderRadius: "9px", border: "none", fontFamily: FONT_UI, fontWeight: 700, fontSize: "13px",
              background: valid ? LIME : "#1c2016", color: valid ? BG : TEXT_QUIETEST, cursor: valid ? "pointer" : "not-allowed",
            }}
          >
            Сохранить
          </button>
        </div>
      </div>
    </>
  );
}
