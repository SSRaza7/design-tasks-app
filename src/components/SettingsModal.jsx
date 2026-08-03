import { useState } from "react";
import { X, Send } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { LIME, BG, SURFACE, SURFACE_2, BORDER, TEXT, TEXT_MUTED, inputStyle } from "../lib/constants";

const fontStack = "'Space Grotesk', 'Inter', sans-serif";

export default function SettingsModal({ userId, currentChatId, onClose, onSaved }) {
  const [chatId, setChatId] = useState(currentChatId || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    await supabase.from("profiles").update({ telegram_chat_id: chatId.trim() || null }).eq("id", userId);
    setSaving(false);
    setSaved(true);
    onSaved?.(chatId.trim());
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "20px" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "14px", width: "100%", maxWidth: "440px", padding: "22px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div style={{ fontFamily: fontStack, fontWeight: 600, fontSize: "17px", color: TEXT, display: "flex", alignItems: "center", gap: "6px" }}>
            <Send size={16} /> Уведомления в Telegram
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: TEXT_MUTED }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ fontSize: "12.5px", color: TEXT_MUTED, lineHeight: 1.6, marginBottom: "14px" }}>
          1. Найдите нашего бота в Telegram и нажмите Start.<br />
          2. Напишите боту <b style={{ color: TEXT }}>@userinfobot</b> — он пришлёт ваш числовой ID.<br />
          3. Вставьте этот ID сюда и сохраните.
        </div>

        <div style={{ fontSize: "11.5px", color: TEXT_MUTED, marginBottom: "4px", fontWeight: 500 }}>Ваш Telegram ID</div>
        <input
          value={chatId}
          onChange={(e) => setChatId(e.target.value)}
          placeholder="Например: 987654321"
          style={inputStyle}
        />

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
