import { useState } from "react";
import { Mail, Lock, Tag } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { LIME, LIME_DIM, BG, SURFACE, BORDER, TEXT, TEXT_MUTED, loginInputStyle } from "../lib/constants";

const fontStack = "'Space Grotesk', 'Inter', sans-serif";

export default function AuthScreen() {
  const [mode, setMode] = useState("signin"); // 'signin' | 'signup'
  const [role, setRole] = useState("buyer");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignIn(e) {
    e.preventDefault();
    setError(""); setInfo("");
    if (!email.trim() || !password.trim()) { setError("Заполните email и пароль"); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) setError(error.message);
  }

  async function handleSignUp(e) {
    e.preventDefault();
    setError(""); setInfo("");
    if (!username.trim()) { setError("Придумайте тег"); return; }
    if (!email.trim() || !password.trim()) { setError("Заполните email и пароль"); return; }
    if (password.length < 6) { setError("Пароль должен быть не короче 6 символов"); return; }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }
    if (data.user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({ id: data.user.id, email: email.trim(), role, username: username.trim() });
      if (profileError) {
        setLoading(false);
        setError(
          profileError.message.includes("duplicate")
            ? "Этот тег уже занят, придумайте другой"
            : profileError.message
        );
        return;
      }
    }
    setLoading(false);
    if (!data.session) {
      setInfo("Проверьте почту и подтвердите регистрацию, затем войдите.");
      setMode("signin");
    }
  }

  return (
    <div style={{
      fontFamily: "'Inter', sans-serif", background: BG, minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", color: TEXT,
    }}>
      <style>{`
        .auth-input:focus { border-color: ${LIME} !important; box-shadow: 0 0 0 2px ${LIME}22; }
        .auth-btn:hover { background: ${LIME_DIM} !important; }
      `}</style>
      <div style={{ width: "100%", maxWidth: "380px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "28px" }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: LIME, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: BG, fontSize: "15px" }}>D</div>
          <span style={{ fontFamily: fontStack, fontWeight: 600, fontSize: "16px" }}>DesignFlow</span>
        </div>

        <h1 style={{ fontFamily: fontStack, fontWeight: 600, fontSize: "22px", margin: "0 0 6px" }}>
          {mode === "signin" ? "Вход в трекер" : "Регистрация"}
        </h1>
        <p style={{ fontSize: "13px", color: TEXT_MUTED, margin: "0 0 24px" }}>Постановка задач для дизайн-отдела</p>

        {mode === "signup" && (
          <div style={{ display: "flex", gap: "8px", marginBottom: "18px" }}>
            <button
              type="button"
              onClick={() => setRole("buyer")}
              style={{
                flex: 1, padding: "9px", borderRadius: "8px", fontSize: "13px", cursor: "pointer",
                border: `1px solid ${role === "buyer" ? LIME : BORDER}`,
                background: role === "buyer" ? LIME : SURFACE,
                color: role === "buyer" ? BG : TEXT,
                fontWeight: role === "buyer" ? 600 : 400,
              }}
            >
              Я — баер
            </button>
            <button
              type="button"
              onClick={() => setRole("designer")}
              style={{
                flex: 1, padding: "9px", borderRadius: "8px", fontSize: "13px", cursor: "pointer",
                border: `1px solid ${role === "designer" ? LIME : BORDER}`,
                background: role === "designer" ? LIME : SURFACE,
                color: role === "designer" ? BG : TEXT,
                fontWeight: role === "designer" ? 600 : 400,
              }}
            >
              Я — дизайнер
            </button>
          </div>
        )}

        <form onSubmit={mode === "signin" ? handleSignIn : handleSignUp}>
          {mode === "signup" && (
            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "12px", color: TEXT_MUTED, display: "block", marginBottom: "6px" }}>Тег (как вас видеть в трекере)</label>
              <div style={{ position: "relative" }}>
                <Tag size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: TEXT_MUTED }} />
                <input
                  className="auth-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Например: Лёша"
                  style={{ ...loginInputStyle, paddingLeft: "36px" }}
                />
              </div>
            </div>
          )}

          <div style={{ marginBottom: "14px" }}>
            <label style={{ fontSize: "12px", color: TEXT_MUTED, display: "block", marginBottom: "6px" }}>Email</label>
            <div style={{ position: "relative" }}>
              <Mail size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: TEXT_MUTED }} />
              <input
                className="auth-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@studio.com"
                style={{ ...loginInputStyle, paddingLeft: "36px" }}
              />
            </div>
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ fontSize: "12px", color: TEXT_MUTED, display: "block", marginBottom: "6px" }}>Пароль</label>
            <div style={{ position: "relative" }}>
              <Lock size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: TEXT_MUTED }} />
              <input
                className="auth-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ ...loginInputStyle, paddingLeft: "36px" }}
              />
            </div>
          </div>

          {error && <div style={{ color: "#E85D3D", fontSize: "12.5px", marginBottom: "10px" }}>{error}</div>}
          {info && <div style={{ color: LIME_DIM, fontSize: "12.5px", marginBottom: "10px" }}>{info}</div>}

          <button
            type="submit"
            disabled={loading}
            className="auth-btn"
            style={{
              width: "100%", marginTop: "8px", padding: "11px", borderRadius: "8px", border: "none",
              background: LIME, color: BG, fontWeight: 600, fontSize: "13.5px", cursor: "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Подождите..." : mode === "signin" ? "Войти" : "Зарегистрироваться"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "16px", fontSize: "12.5px", color: TEXT_MUTED }}>
          {mode === "signin" ? (
            <>Нет аккаунта? <a onClick={() => { setMode("signup"); setError(""); setInfo(""); }} style={{ color: LIME, cursor: "pointer" }}>Зарегистрироваться</a></>
          ) : (
            <>Уже есть аккаунт? <a onClick={() => { setMode("signin"); setError(""); setInfo(""); }} style={{ color: LIME, cursor: "pointer" }}>Войти</a></>
          )}
        </div>
      </div>
    </div>
  );
}
