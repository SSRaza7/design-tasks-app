import { useState, useEffect, useRef } from "react";
import { LIME, TEXT, SURFACE, SURFACE_2, BORDER, TEXT_MUTED, inputStyle } from "../lib/constants";

export default function SearchableSelect({ options, value, onChange, placeholder, disabled }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = options.filter((o) => o.toLowerCase().includes(query.toLowerCase()));

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <input
        disabled={disabled}
        value={open ? query : value}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => { if (!disabled) { setQuery(""); setOpen(true); } }}
        placeholder={placeholder}
        style={{ ...inputStyle, opacity: disabled ? 0.7 : 1 }}
      />
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, maxHeight: "220px",
          overflowY: "auto", background: SURFACE_2, border: `1px solid ${BORDER}`, borderRadius: "7px", zIndex: 20,
        }}>
          {filtered.length === 0 && (
            <div style={{ padding: "8px 10px", fontSize: "12.5px", color: TEXT_MUTED }}>Ничего не найдено</div>
          )}
          {filtered.map((o) => (
            <div
              key={o}
              onClick={() => { onChange(o); setOpen(false); setQuery(""); }}
              onMouseEnter={(e) => (e.currentTarget.style.background = SURFACE)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              style={{
                padding: "7px 10px", fontSize: "13px", cursor: "pointer",
                color: o === value ? LIME : TEXT,
              }}
            >
              {o}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
