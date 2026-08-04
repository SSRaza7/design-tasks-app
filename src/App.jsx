import { useState, useEffect, useMemo } from "react";
import { Search, Settings } from "lucide-react";
import { supabase } from "./lib/supabaseClient";
import AuthScreen from "./components/AuthScreen";
import Sidebar from "./components/Sidebar";
import StatusSummary from "./components/StatusSummary";
import TaskListView from "./components/TaskListView";
import TaskKanbanView from "./components/TaskKanbanView";
import TaskPanel from "./components/TaskPanel";
import NewTaskModal from "./components/NewTaskModal";
import SettingsModal from "./components/SettingsModal";
import Dashboard from "./components/Dashboard";
import {
  BG, SURFACE_2, BORDER, BORDER_INPUT, BORDER_INPUT_HOVER,
  TEXT, TEXT_QUIET, TEXT_QUIETEST, SURFACE_TOGGLE,
  LIME, primaryBtnStyle, ghostBtnStyle, FONT_MONO, FONT_UI,
} from "./lib/constants";

const NAV_LABELS = {
  tasks: "Все задачи",
  mine: "Мои задачи",
  unassigned: "Без исполнителя",
  archive: "Архив",
  dashboard: "Дашборд",
};

export default function App() {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const [tasks, setTasks] = useState([]);
  const [celebsByGeo, setCelebsByGeo] = useState({});

  const [nav, setNav] = useState("tasks");
  const [buyerFilter, setBuyerFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [panelTaskId, setPanelTaskId] = useState(null);
  const [creating, setCreating] = useState(false);

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

  async function handleCreate(draft) {
    await rememberCelebs(draft.geo, draft.celebs);
    await supabase.from("tasks").insert({
      title: draft.title, type: draft.type, priority: draft.priority, status: "Ожидание",
      format: draft.format, geo: draft.geo, language: draft.language, celebs: draft.celebs,
      description: draft.description, task_link: draft.taskLink,
      created_at: new Date().toISOString(),
      posted_by: profile?.username || session.user.email, posted_by_id: session.user.id,
    });
    setCreating(false);
    fetchTasks();
  }

  async function handleTakeIntoWork(task) {
    await supabase.from("tasks").update({
      status: "В работе",
      status_updated_at: new Date().toISOString(),
      assigned_designer: profile?.username || session.user.email,
      assigned_designer_id: session.user.id,
    }).eq("id", task.id);
    fetchTasks();
  }

  const STATUS_ORDER = ["Ожидание", "В работе", "На ревью", "Готово"];
async function handleAdvance(task) {
  const idx = STATUS_ORDER.indexOf(task.status);
  if (idx === -1 || idx === STATUS_ORDER.length - 1) return;
  const nextStatus = STATUS_ORDER[idx + 1];
  const update = { status: nextStatus, status_updated_at: new Date().toISOString() };
  if (nextStatus === "На ревью") update.revision_note = null;
  await supabase.from("tasks").update(update).eq("id", task.id);
  fetchTasks();
}

async function handleRequestChanges(task, note) {
  await supabase.from("tasks").update({
    status: "В работе",
    status_updated_at: new Date().toISOString(),
    revision_note: note,
  }).eq("id", task.id);
  fetchTasks();
}

  async function handleDelete(id) {
    await supabase.from("tasks").delete().eq("id", id);
    setPanelTaskId(null);
    fetchTasks();
  }

  async function handleSaveCreative(id, link) {
    await supabase.from("tasks").update({ creative_link: link }).eq("id", id);
    fetchTasks();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  const isTeamLead = role === "buyer" && !!profile?.is_team_lead;
  const showBuyerFilter = role === "designer" || isTeamLead;

  const buyerOptions = useMemo(() => {
    const map = {};
    tasks.forEach((t) => { if (t.posted_by) map[t.posted_by] = (map[t.posted_by] || 0) + 1; });
    return Object.entries(map).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [tasks]);

  const navCounts = useMemo(() => {
    const mine = role === "designer"
      ? tasks.filter((t) => t.assigned_designer_id === session?.user?.id).length
      : tasks.filter((t) => t.posted_by_id === session?.user?.id).length;
    return {
      tasks: tasks.length,
      mine,
      unassigned: tasks.filter((t) => !t.assigned_designer_id).length,
      archive: tasks.filter((t) => t.status === "Готово").length,
    };
  }, [tasks, role, session]);

  const navFiltered = useMemo(() => {
    if (nav === "mine") {
      return role === "designer"
        ? tasks.filter((t) => t.assigned_designer_id === session?.user?.id)
        : tasks.filter((t) => t.posted_by_id === session?.user?.id);
    }
    if (nav === "unassigned") return tasks.filter((t) => !t.assigned_designer_id);
    if (nav === "archive") return tasks.filter((t) => t.status === "Готово");
    return tasks;
  }, [tasks, nav, role, session]);

  const buyerFilteredTasks = useMemo(
    () => (buyerFilter === "all" ? navFiltered : navFiltered.filter((t) => t.posted_by === buyerFilter)),
    [navFiltered, buyerFilter]
  );

  const searched = useMemo(() => {
    if (!query.trim()) return buyerFilteredTasks;
    const q = query.trim().toLowerCase();
    return buyerFilteredTasks.filter((t) =>
      (t.title || "").toLowerCase().includes(q) ||
      `des-${String(t.id).padStart(3, "0")}`.includes(q) ||
      (t.geo || "").toLowerCase().includes(q)
    );
  }, [buyerFilteredTasks, query]);

  const navItems = [
    { id: "tasks", label: "Все задачи", count: navCounts.tasks },
    { id: "mine", label: "Мои задачи", count: navCounts.mine },
    { id: "unassigned", label: "Без исполнителя", count: navCounts.unassigned },
    { id: "archive", label: "Архив", count: navCounts.archive },
    { id: "dashboard", label: "Дашборд", count: "" },
  ];

  if (authLoading) return null;
  if (!session) return <AuthScreen />;
  if (!role) {
    return (
      <div style={{ background: BG, minHeight: "100vh", color: TEXT, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_UI }}>
        Загрузка профиля...
      </div>
    );
  }

  const panelTask = panelTaskId ? tasks.find((t) => t.id === panelTaskId) : null;
  const displayName = profile?.username || session.user.email;
  const roleLabel = role === "designer" ? "ДИЗАЙНЕР" : isTeamLead ? "ТИМЛИД" : "БАЕР";
  const breadcrumb = `ДИЗАЙН-СТУДИЯ / ${role === "designer" ? "ПОРТАЛ ДИЗАЙНЕРА" : isTeamLead ? "ПОСТАНОВКА ЗАДАЧ / ТИМЛИД" : "ПОСТАНОВКА ЗАДАЧ"}`;

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, display: "grid", gridTemplateColumns: "216px 1fr", fontFamily: FONT_UI }}>
      <Sidebar
        navItems={navItems}
        nav={nav}
        setNav={setNav}
        showBuyerFilter={showBuyerFilter}
        buyerOptions={buyerOptions}
        buyerFilter={buyerFilter}
        setBuyerFilter={setBuyerFilter}
        displayName={displayName}
        roleLabel={roleLabel}
        onLogout={handleLogout}
      />

      <main style={{ minWidth: 0, display: "flex", flexDirection: "column" }}>
        <header
          style={{
            position: "sticky", top: 0, zIndex: 5, background: "rgba(10,11,10,.92)", backdropFilter: "blur(12px)",
            borderBottom: `1px solid ${BORDER}`, padding: "14px 24px", display: "flex", alignItems: "center", gap: "14px", overflowX: "auto",
          }}
        >
          <div style={{ flex: "none" }}>
            <div style={{ fontFamily: FONT_MONO, fontSize: "9.5px", letterSpacing: ".16em", color: TEXT_QUIETEST, marginBottom: "4px", whiteSpace: "nowrap" }}>
              {breadcrumb}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
              <h1 style={{ margin: 0, fontFamily: FONT_UI, fontSize: "21px", fontWeight: 800, letterSpacing: "-.02em", whiteSpace: "nowrap" }}>
                {NAV_LABELS[nav]}
              </h1>
              {nav !== "dashboard" && (
                <span style={{ fontFamily: FONT_MONO, fontSize: "11px", color: TEXT_QUIET }}>
                  {searched.length} из {navFiltered.length}
                </span>
              )}
            </div>
          </div>

          <div style={{ flex: 1 }} />

          {nav !== "dashboard" && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: "none" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "7px", height: "34px", padding: "0 11px", border: `1px solid ${BORDER_INPUT}`, borderRadius: "9px", background: SURFACE_2 }}>
                <Search size={13} color={TEXT_QUIET} strokeWidth={2.2} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Поиск задачи"
                  style={{ all: "unset", width: "150px", fontFamily: FONT_UI, fontSize: "12.5px", color: TEXT }}
                />
              </label>

              <div style={{ display: "flex", background: SURFACE_2, border: `1px solid ${BORDER_INPUT}`, borderRadius: "9px", padding: "3px", gap: "2px", height: "34px" }}>
                {[["list", "Список"], ["board", "Канбан"]].map(([id, label]) => (
                  <button
                    key={id}
                    onClick={() => setViewMode(id)}
                    style={{
                      padding: "0 12px", borderRadius: "7px", border: "none", cursor: "pointer",
                      fontFamily: FONT_UI, fontWeight: 600, fontSize: "12.5px",
                      background: viewMode === id ? SURFACE_TOGGLE : "transparent",
                      color: viewMode === id ? TEXT : "#6b7361",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {role === "buyer" && (
                <button onClick={() => setCreating(true)} style={primaryBtnStyle}>
                  <span style={{ fontSize: "15px", lineHeight: 1, marginTop: "-1px" }}>+</span>Новая задача
                </button>
              )}

              <div style={{ width: "1px", height: "22px", background: BORDER_INPUT, margin: "0 2px" }} />

              <button onClick={() => setShowSettings(true)} style={ghostBtnStyle} title="Настройки">
                <Settings size={15} />
              </button>
            </div>
          )}
        </header>

        {nav === "dashboard" ? (
          <div style={{ padding: "20px 24px" }}>
            <Dashboard tasks={tasks} role={role} isTeamLead={isTeamLead} />
          </div>
        ) : (
          <>
            <StatusSummary tasks={navFiltered} onSelectStatus={() => setViewMode("board")} />
            {viewMode === "list" ? (
              <TaskListView tasks={searched} onOpen={(t) => setPanelTaskId(t.id)} />
            ) : (
              <TaskKanbanView tasks={searched} onOpen={(t) => setPanelTaskId(t.id)} />
            )}
          </>
        )}
      </main>

      {panelTask && (
        <TaskPanel
  task={panelTask}
  role={role}
  onClose={() => setPanelTaskId(null)}
  onTakeIntoWork={handleTakeIntoWork}
  onAdvance={handleAdvance}
  onDelete={handleDelete}
  onSaveCreative={handleSaveCreative}
  onRequestChanges={handleRequestChanges}
/>
      )}

      {creating && (
        <NewTaskModal
          nextId={tasks.reduce((m, t) => Math.max(m, t.id), 0) + 1}
          celebsByGeo={celebsByGeo}
          onClose={() => setCreating(false)}
          onCreate={handleCreate}
        />
      )}

      {showSettings && (
        <SettingsModal
          userId={session.user.id}
          currentChatId={profile?.telegram_chat_id}
          currentUsername={profile?.username}
          onClose={() => setShowSettings(false)}
          onSaved={({ chatId, username }) => setProfile((p) => ({ ...p, telegram_chat_id: chatId, username }))}
        />
      )}
    </div>
  );
}
