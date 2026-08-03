import { TEXT_MUTED } from "../lib/constants";

export function Field({ label, children }) {
  return (
    <div style={{ marginBottom: "12px", flex: 1 }}>
      <div style={{ fontSize: "11.5px", color: TEXT_MUTED, marginBottom: "4px", fontWeight: 500 }}>{label}</div>
      {children}
    </div>
  );
}

export function Row({ children }) {
  return <div style={{ display: "flex", gap: "12px" }}>{children}</div>;
}
