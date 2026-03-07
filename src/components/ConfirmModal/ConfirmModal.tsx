import { useT } from "../../hooks/useTranslation"

interface Props {
  text: string
  onConfirm: () => void
  onCancel: () => void
  unmark?: boolean
}

export default function ConfirmModal({ text, onConfirm, onCancel, unmark }: Props) {
  const txt = useT()
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "#00000088",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: "#0f0f1a",
        border: "1px solid #1e1e2e",
        borderRadius: 12, padding: "24px 28px",
        minWidth: 300, textAlign: "center",
      }}>
        <div style={{ fontSize: 14, color: "#e4e4f0", marginBottom: 8 }}>
          {unmark ? txt.unmarkTitle : txt.confirmComplete}
        </div>
        <div style={{
          fontSize: 12, color: "#71717a", marginBottom: 24,
          maxWidth: 260, margin: "0 auto 24px",
        }}>
          {text}
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          <button onClick={onCancel} style={{
            background: "transparent", border: "1px solid #1e1e2e",
            color: "#71717a", padding: "7px 20px", borderRadius: 6,
            fontSize: 12, cursor: "pointer",
          }}>
            {txt.cancel}
          </button>
          <button onClick={onConfirm} style={{
            background: "#22c55e", border: "none",
            color: "#000", padding: "7px 20px", borderRadius: 6,
            fontSize: 12, cursor: "pointer", fontWeight: 600,
          }}>
            {unmark ? txt.unmark : txt.complete}
          </button>
        </div>
      </div>
    </div>
  )
}