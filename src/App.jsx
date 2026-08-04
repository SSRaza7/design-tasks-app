import { useState, useEffect } from "react";
import { Plus, LogOut, RefreshCw, Paperclip, Settings } from "lucide-react";
import { supabase } from "./lib/supabaseClient";
import AuthScreen from "./components/AuthScreen";
import TaskModal from "./components/TaskModal";
import SettingsModal from "./components/SettingsModal";
import {
  STATUSES, STATUS_META, TYPES, COUNTRIES, LANGUAGES,
  priorityMeta, countryFlag, formatDateTime,
  LIME, LIME_DIM, BG, SURFACE, SURFACE_2, BORDER, TEXT, TEXT_MUTED,
  primaryBtnStyle, ghostBtnStyle,
} from "./lib/constants";

const fontStack = "'Space Grotesk', 'Inter', sans-serif";

const emptyDraft = {
  title: "", type: TYPES[0], priority: "Средний", status: "Ожидание",
  format: [], geo: COUNTRIES[0], language: LANGUAGES[0], celebs: [],
  description: "", taskLink: "", creativeLink: "",
};

function nextActionLabel(status) {
  if (status === "Ожидание") return "Взять в работу";
  if (status === "В работе") return "Отправить на ревью";
  if (status === "На ревью") return "Готово";
  return null;
}

export default function App() {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const [tasks, setTasks] = useState([]);
  const [celebsByGeo, setCelebsByGeo] = useState({});
  const [modal, setModal] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setRole(null); setProfile(null); return; }
    (async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
      setRole(data?.role || null);
      setProfile(data || null);
    })();
  }, [session]);

  useEffect(() => {
    if (!session) return;
    fetchTasks();
    fetchCelebs();

    const channel = supabase
      .channel("tasks-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => fetchTasks())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [session]);

  async function fetchTasks() {
    const { data } = await supabase.from("tasks").select("*").order("created_at", { ascending: false });
    setTasks(data || []);
  }

  async function fetchCelebs() {
    const { data } = await supabase.from("celebs_by_geo").select("*");
    const map = {};
    (data || []).forEach((row) => { map[row.geo] = row.names || []; });
    setCelebsByGeo(map);
  }

  async function rememberCelebs(geo, names) {
    if (!names.length) return;
    const existing = celebsByGeo[geo] || [];
    const merged = [...existing];
    names.forEach((n) => {
      if (!merged.some((e) => e.toLowerCase() === n.toLowerCase())) merged.push(n);
    });
    await supabase.from("celebs_by_geo").upsert({ geo, names: merged });
    setCelebsByGeo((prev) => ({ ...prev, [geo]: merged }));
  }

  function openNew() {
    setModal({ mode: "new", draft: { ...emptyDraft }, editingId: null });
  }
  function openEdit(task) {
    setModal({
      mode: "edit",
      draft: {
        title: task.title, type: task.type, priority: task.priority, status: task.status,
        format: task.format || [], geo: task.geo, language: task.language, celebs: task.celebs || [],
        description: task.description || "", taskLink: task.task_link || "", creativeLink: task.creative_link || "",
        assignedDesigner: task.assigned_designer || "",
      },
      editingId: task.id,
    });
  }
  function closeModal() { setModal(null); }

  async function saveModal(draft) {
    if (!draft.title.trim()) return;
    await rememberCelebs(draft.geo, draft.celebs);
    const now = new Date().toISOString();

    if (modal.mode === "new") {
      await supabase.from("tasks").insert({
        title: draft.title, type: draft.type, priority: draft.priority, status: "Ожидание",
        format: draft.format, geo: draft.geo, language: draft.language, celebs: draft.celebs,
        description: draft.description, task_link: draft.taskLink, creative_link: draft.creativeLink,
        created_at: now, posted_by: session.user.email, posted_by_id: session.user.id,
      });
    } else {
      const original = tasks.find((t) => t.id === modal.editingId);
      const statusChanged = original && original.status !== draft.status;
      const update = {
        title: draft.title, type: draft.type, priority: draft.priority, status: draft.status,
        format: draft.format, geo: draft.geo, language: draft.language, celebs: draft.celebs,
        description: draft.description, task_link: draft.taskLink, creative_link: draft.creativeLink,
        status_updated_at: statusChanged ? now : original?.status_updated_at,
      };
      if (
        statusChanged &&
        draft.status === "В работе" &&
        role === "designer" &&
        !original?.assigned_designer_id
      ) {
        update.assigned_designer = session.user.email;
        update.assigned_designer_id = session.user.id;
      }
      await supabase.from("tasks").update(update).eq("id", modal.editingId);
    }
    closeModal();
    fetchTasks();
  }

  async function deleteTask(id) {
    await supabase.from("tasks").delete().eq("id", id);
    closeModal();
    fetchTasks();
  }

  async function advanceStatus(task, e) {
    if (e) e.stopPropagation();
    const idx = STATUSES.indexOf(task.status);
    if (idx === -1 || idx === STATUSES.length - 1) return;
    const next = STATUSES[idx + 1];
    const update = { status: next, status_updated_at: new Date().toISOString() };
    if (task.status === "Ожидание" && role === "designer" && !task.assigned_designer_id) {
      update.assigned_designer = session.user.email;
      update.assigned_designer_id = session.user.id;
    }
    await supabase.from("tasks").update(update).eq("id", task.id);
    fetchTasks();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  if (authLoading) return null;
  if (!session) return <AuthScreen />;
  if (!role) {
    return (
      <div style={{ background: BG, minHeight: "100vh", color: TEXT, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif" }}>
        Загрузка профиля...
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: BG, minHeight: "100vh", padding: "28px", color: TEXT }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "22px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "12px", letterSpacing: "0.06em", color: LIME_DIM, marginBottom: "4px" }}>
            ДИЗАЙН-СТУДИЯ / {role === "designer" ? "ПОРТАЛ ДИЗАЙНЕРА" : "ПОСТАНОВКА ЗАДАЧ"}
          </div>
          <h1 style={{ fontFamily: fontStack, fontWeight: 600, fontSize: "26px", margin: 0, color: TEXT }}>
            {role === "designer" ? "Задачи в работе" : "Задачи"}
          </h1>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {role === "buyer" && (
            <button onClick={openNew} style={primaryBtnStyle}>
              <Plus size={15} /> Новая задача
            </button>
          )}
          <button onClick={() => setShowSettings(true)} style={ghostBtnStyle} title="Уведомления Telegram">
            <Settings size={15} />
          </button>
          <button onClick={handleLogout} style={ghostBtnStyle} title="Выйти">
            <LogOut size={15} />
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {tasks.length === 0 && (
          <div style={{ color: TEXT_MUTED, fontSize: "13px", padding: "24px 0", textAlign: "center", border: `1px dashed ${BORDER}`, borderRadius: "10px" }}>
            Пока нет задач
          </div>
        )}
        {tasks.map((task) => {
          const pm = priorityMeta(task.priority);
          const sm = STATUS_META[task.status] || STATUS_META["Ожидание"];
          return (
            <div
              key={task.id}
              onClick={() => openEdit(task)}
              style={{
                display: "flex", alignItems: "center", gap: "18px", flexWrap: "wrap",
                background: SURFACE, border: `1px solid ${BORDER}`, borderLeft: `3px solid ${pm.tab}`,
                borderRadius: "10px", padding: "14px 18px", cursor: "pointer",
              }}
            >
              <div style={{ minWidth: "108px" }}>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "12px", color: TEXT_MUTED }}>
                  {formatDateTime(new Date(task.created_at))}
                </div>
                {task.status_updated_at && (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", marginTop: "4px", fontSize: "10.5px", color: TEXT_MUTED, background: SURFACE_2, borderRadius: "20px", padding: "2px 8px" }}>
                    <RefreshCw size={10} /> {formatDateTime(new Date(task.status_updated_at))}
                  </div>
                )}
              </div>

              <div style={{ flex: "1 1 220px", minWidth: 0 }}>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", color: TEXT_MUTED, marginBottom: "2px" }}>
                  DES-{String(task.id).padStart(3, "0")}
                </div>
                <div style={{ fontSize: "14px", fontWeight: 500, color: TEXT, display: "flex", alignItems: "center", gap: "6px" }}>
                  {task.geo && <span style={{ fontSize: "15px" }}>{countryFlag(task.geo)}</span>}
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.title}</span>
                </div>
              </div>

              <div style={{ minWidth: "160px" }}>
                <div style={{ fontSize: "11px", color: TEXT_MUTED, marginBottom: "2px" }}>Постановщик</div>
                <div style={{ fontSize: "13px", fontWeight: 500, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {task.posted_by}
                </div>
              </div>

              <div style={{ minWidth: "160px" }}>
                <div style={{ fontSize: "11px", color: TEXT_MUTED, marginBottom: "2px" }}>Исполнитель</div>
                <div style={{ fontSize: "13px", fontWeight: 500, color: task.assigned_designer ? TEXT : TEXT_MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {task.assigned_designer || "не назначен"}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {task.creative_link && (
                  <span title="Есть креатив" style={{ display: "inline-flex", alignItems: "center", color: TEXT_MUTED }}>
                    <Paperclip size={14} />
                  </span>
                )}
                <span style={{ fontSize: "12px", fontWeight: 600, color: sm.color, background: sm.bg, borderRadius: "20px", padding: "5px 14px", whiteSpace: "nowrap" }}>
                  {task.status}
                </span>
                {role === "designer" && nextActionLabel(task.status) && (
                  <button onClick={(e) => advanceStatus(task, e)} style={{ fontSize: "12px", fontWeight: 600, color: BG, background: LIME, border: "none", borderRadius: "20px", padding: "5px 14px", cursor: "pointer", whiteSpace: "nowrap" }}>
                    {nextActionLabel(task.status)}
                  </button>
                )}
                {role === "buyer" && task.status === "На ревью" && (
                  <button onClick={(e) => advanceStatus(task, e)} style={{ fontSize: "12px", fontWeight: 600, color: BG, background: LIME, border: "none", borderRadius: "20px", padding: "5px 14px", cursor: "pointer", whiteSpace: "nowrap" }}>
                    Утвердить
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {modal && (
        <TaskModal
          modal={modal}
          setModal={setModal}
          role={role}
          onClose={closeModal}
          onSave={saveModal}
          onDelete={deleteTask}
          celebsByGeo={celebsByGeo}
        />
      )}

      {showSettings && (
        <SettingsModal
          userId={session.user.id}
          currentChatId={profile?.telegram_chat_id}
          onClose={() => setShowSettings(false)}
          onSaved={(chatId) => setProfile((p) => ({ ...p, telegram_chat_id: chatId }))}
        />
      )}
    </div>
  );
}
