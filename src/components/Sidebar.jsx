import { LogOut } from "lucide-react";
import {
  BG, BG_SIDEBAR, LIME, TEXT, TEXT_MUTED, TEXT_QUIET, TEXT_QUIETEST,
  SURFACE_CHIP, SURFACE_RAISED, BORDER, BORDER_CHIP, FONT_MONO, FONT_UI,
  BUYER_DOT_COLORS,
} from "../lib/constants";

function initials(name) {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function Sidebar({ navItems, nav, setNav, showBuyerFilter, buyerOptions, buyerFilter, setBuyerFilter, displayName, roleLabel, onLogout }) {
  return (
    <aside
      style={{
        borderRight: `1px solid ${BORDER}`, background: BG_SIDEBAR, display: "flex",
        flexDirection: "column", gap: "20px", padding: "18px 14px",
        position: "sticky", top: 0, height: "100vh",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "9px", padding: "0 6px" }}>
        <div style={{ width: "26px", height: "26px", borderRadius: "7px", background: LIME, display: "grid", placeItems: "center", fontFamily: FONT_MONO, fontWeight: 700, fontSize: "13px", color: BG }}>
          R
        </div>
        <div>
          <div style={{ fontFamily: FONT_MONO, fontSize: "12px", letterSpacing: ".16em", fontWeight: 700, color: TEXT }}>RAZA</div>
          <div style={{ fontFamily: FONT_MONO, fontSize: "9px", letterSpacing: ".2em", color: TEXT_QUIET }}>TEAM OS</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <div style={{ fontFamily: FONT_MONO, fontSize: "9px", letterSpacing: ".18em", color: TEXT_QUIETEST, padding: "0 8px 6px" }}>РАБОТА</div>
        {navItems.map((n) => {
          const active = nav === n.id;
          return (
            <div
              key={n.id}
              onClick={() => setNav(n.id)}
              className={active ? "" : "sb-nav-item"}
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px",
                padding: "8px 9px", borderRadius: "8px", cursor: "pointer",
                background: active ? LIME : "transparent", color: active ? BG : TEXT_MUTED,
              }}
            >
              <span style={{ fontFamily: FONT_UI, fontSize: "13px", fontWeight: 600 }}>{n.label}</span>
              <span style={{ fontFamily: FONT_MONO, fontSize: "10.5px", color: active ? "rgba(10,11,10,.6)" : TEXT_QUIET }}>
                {n.count}
              </span>
            </div>
          );
        })}
      </div>

      {showBuyerFilter && (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: "9px", letterSpacing: ".18em", color: TEXT_QUIETEST, padding: "0 8px 6px" }}>ФИЛЬТР</div>
          <div
            onClick={() => setBuyerFilter("all")}
            className={buyerFilter === "all" ? "" : "sb-buyer-item"}
            style={{
              display: "flex", alignItems: "center", gap: "9px", padding: "8px 9px", borderRadius: "8px", cursor: "pointer",
              background: buyerFilter === "all" ? SURFACE_CHIP : "transparent",
              boxShadow: buyerFilter === "all" ? `inset 0 0 0 1px ${BORDER_CHIP}` : "none",
            }}
          >
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: LIME, flexShrink: 0 }} />
            <span style={{ fontFamily: FONT_UI, fontSize: "12.5px", fontWeight: 500, color: TEXT, flex: 1 }}>Все баеры</span>
          </div>
          {buyerOptions.map((b, i) => (
            <div
              key={b.name}
              onClick={() => setBuyerFilter(b.name)}
              className={buyerFilter === b.name ? "" : "sb-buyer-item"}
              style={{
                display: "flex", alignItems: "center", gap: "9px", padding: "8px 9px", borderRadius: "8px", cursor: "pointer",
                background: buyerFilter === b.name ? SURFACE_CHIP : "transparent",
                boxShadow: buyerFilter === b.name ? `inset 0 0 0 1px ${BORDER_CHIP}` : "none",
              }}
            >
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: BUYER_DOT_COLORS[i % BUYER_DOT_COLORS.length], flexShrink: 0 }} />
              <span style={{ fontFamily: FONT_UI, fontSize: "12.5px", fontWeight: 500, color: TEXT, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {b.name}
              </span>
              <span style={{ fontFamily: FONT_MONO, fontSize: "10.5px", color: TEXT_QUIET }}>{b.count}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: "auto", borderTop: `1px solid ${BORDER}`, paddingTop: "12px", display: "flex", alignItems: "center", gap: "9px" }}>
        <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: SURFACE_RAISED, border: `1px solid #2a2f22`, display: "grid", placeItems: "center", fontFamily: FONT_MONO, fontSize: "11px", fontWeight: 700, color: LIME, flexShrink: 0 }}>
          {initials(displayName)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: FONT_UI, fontSize: "12.5px", fontWeight: 600, color: TEXT, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {displayName}
          </div>
          <div style={{ fontFamily: FONT_MONO, fontSize: "9.5px", letterSpacing: ".1em", color: TEXT_QUIET }}>{roleLabel}</div>
        </div>
        <div onClick={onLogout} title="Выйти" className="sb-logout" style={{ width: "26px", height: "26px", borderRadius: "7px", display: "grid", placeItems: "center", color: TEXT_QUIET, cursor: "pointer", flexShrink: 0 }}>
          <LogOut size={14} />
        </div>
      </div>

      <style>{`
        .sb-nav-item:hover { background: ${SURFACE_CHIP} !important; color: ${TEXT} !important; }
        .sb-buyer-item:hover { background: ${SURFACE_CHIP} !important; }
        .sb-logout:hover { background: ${SURFACE_RAISED} !important; color: ${TEXT} !important; }
      `}</style>
    </aside>
  );
}
