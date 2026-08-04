-- ============================================================
-- Миграция: Telegram-уведомления
-- Выполните в Supabase Dashboard → SQL Editor
-- ============================================================

-- Telegram chat_id пользователя (заполняется в настройках приложения)
alter table public.profiles
  add column if not exists telegram_chat_id text;

-- Привязка задачи к автору по id (а не только по email) —
-- нужно, чтобы найти telegram_chat_id баера при уведомлении об утверждении
alter table public.tasks
  add column if not exists posted_by_id uuid references public.profiles(id);

-- Разрешаем всем авторизованным читать telegram_chat_id других пользователей
-- (это нужно клиенту не всегда, но серверная функция всё равно работает
-- через service_role и не зависит от RLS — эта политика просто не мешает)
