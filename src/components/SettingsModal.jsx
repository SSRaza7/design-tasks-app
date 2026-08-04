import { useState } from "react";
import { X, Send, Tag } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { LIME, BG, SURFACE, SURFACE_2, BORDER, TEXT, TEXT_MUTED, inputStyle } from "../lib/constants";

const fontStack = "'Space Grotesk', 'Inter', sans-serif";

export default function SettingsModal({ userId, currentChatId, currentUsername, onClose, onSaved }) {
  const [chatId, setChatId] = useState(currentChatId || "");
  const [username, setUsername] = useState(currentUsername || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true);
    setError("");
    const { error: err } = await supabase
      .from("profiles")
      .update({
        telegram_chat_id: chatId.trim() || null,
        username: username.trim() || null,
      })
      .eq("id", userId);
    setSaving(false);
    if (err) {
      setError(err.message.includes("duplicate") ? "Этот тег уже занят, придумайте другой" : err.message);
      return;
    }
    setSaved(true);
    onSaved?.({ chatId: chatId.trim(), username: username.trim() });
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "20px" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "14px", width: "100%", maxWidth: "440px", padding: "22px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div style={{ fontFamily: fontStack, fontWeight: 600, fontSize: "17px", color: TEXT }}>
            Настройки профиля
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: TEXT_MUTED }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600, color: TEXT, marginBottom: "6px" }}>
          <Tag size={14} /> Ваш тег
        </div>
        <div style={{ fontSize: "12px", color: TEXT_MUTED, marginBottom: "8px" }}>
          Отображается вместо почты везде в трекере (Постановщик, Исполнитель, фильтры).
        </div>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Например: Лёша"
          style={{ ...inputStyle, marginBottom: "18px" }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600, color: TEXT, marginBottom: "6px" }}>
          <Send size={14} /> Уведомления в Telegram
        </div>
        <div style={{ fontSize: "12.5px", color: TEXT_MUTED, lineHeight: 1.6, marginBottom: "10px" }}>
          1. Найдите нашего бота в Telegram и нажмите Start.<br />
          2. Напишите боту <b style={{ color: TEXT }}>@userinfobot</b> — он пришлёт ваш числовой ID.<br />
          3. Вставьте этот ID сюда и сохраните.
        </div>
        <input
          value={chatId}
          onChange={(e) => setChatId(e.target.value)}
          placeholder="Например: 987654321"
          style={inputStyle}
        />

        {error && <div style={{ color: "#E85D3D", fontSize: "12.5px", marginTop: "10px" }}>{error}</div>}

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: "100%", marginTop: "16px", padding: "10px", borderRadius: "8px", border: "none",
            background: LIME, color: BG, fontWeight: 600, fontSize: "13.5px", cursor: "pointer",
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? "Сохраняю..." : saved ? "Сохранено ✓" : "Сохранить"}
        </button>
      </div>
    </div>
  );
}
