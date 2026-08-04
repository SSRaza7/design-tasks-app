// Supabase Edge Function: notify-telegram
// Отправляет push-уведомления в Telegram при:
//  - создании новой задачи -> всем дизайнерам
//  - переводе задачи в статус "На ревью" -> баеру, который её поставил
//
// Деплоится через Supabase Dashboard -> Edge Functions -> Deploy a new function
// Вызывается автоматически через Database Webhook (Database -> Webhooks)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TELEGRAM_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function sendTelegram(chatId, text) {
  if (!chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
  } catch (err) {
    console.error("Telegram send error:", err);
  }
}

Deno.serve(async (req) => {
  const payload = await req.json();
  const { type, table, record, old_record } = payload;

  if (table !== "tasks") {
    return new Response(JSON.stringify({ ok: true, skipped: true }), { status: 200 });
  }

  // Новая задача -> уведомить всех дизайнеров
  if (type === "INSERT") {
    const { data: designers } = await supabase
      .from("profiles")
      .select("telegram_chat_id")
      .eq("role", "designer");

    const text =
      `🆕 <b>Новая задача:</b> ${record.title}\n` +
      `Гео: ${record.geo || "—"}\n` +
      `Тип: ${record.type || "—"}\n` +
      `Приоритет: ${record.priority || "—"}`;

    for (const d of designers || []) {
      await sendTelegram(d.telegram_chat_id, text);
    }
  }

  // Статус сменился на "На ревью" -> уведомить баера, поставившего задачу
  if (type === "UPDATE" && old_record?.status !== record.status && record.status === "На ревью") {
    if (record.posted_by_id) {
      const { data: buyer } = await supabase
        .from("profiles")
        .select("telegram_chat_id")
        .eq("id", record.posted_by_id)
        .single();

      if (buyer) {
        const text = `✅ <b>Задача готова к просмотру:</b> ${record.title}`;
        await sendTelegram(buyer.telegram_chat_id, text);
      }
    }
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
});
