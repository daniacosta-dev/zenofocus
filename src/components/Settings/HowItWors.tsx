import { useState } from "react"
import { useT } from "../../hooks/useTranslation"

export default function HowItWorks() {
  const [showHow, setShowHow] = useState(false)
  const txt = useT()

  return (
    <div style={{
      background: "#0a0a14", border: "1px solid #12121e",
      borderRadius: 10, overflow: "hidden", marginTop: 8,
    }}>
      <button
        onClick={() => setShowHow(!showHow)}
        style={{
          width: "100%", background: "transparent", border: "none",
          color: "#e4e4f0", padding: "14px 18px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          cursor: "pointer", fontSize: 13, fontWeight: 600,
        }}
      >
        <span>📖 {txt.howItWorks}</span>
        <span style={{
          fontSize: 10, color: "#52525b",
          transition: "transform 0.2s",
          transform: showHow ? "rotate(180deg)" : "rotate(0deg)",
          display: "inline-block",
        }}>▼</span>
      </button>

      {showHow && (
        <div style={{ padding: "0 18px 18px", borderTop: "1px solid #12121e" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#a1a1aa", margin: "14px 0 12px" }}>
            {txt.howItWorksTitle}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {txt.howItWorksSteps.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: "#12121e", border: "1px solid #1e1e2e",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16,
                }}>
                  {step.icon}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#e4e4f0", marginBottom: 2 }}>
                    {step.title}
                  </div>
                  <div style={{ fontSize: 11, color: "#71717a", lineHeight: 1.5 }}>
                    {step.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 16, padding: "10px 12px",
            background: "#f59e0b11", border: "1px solid #f59e0b33",
            borderRadius: 8, fontSize: 11, color: "#f59e0b", lineHeight: 1.5,
          }}>
            💡 {txt.howItWorksTip}
          </div>
        </div>
      )}
    </div>
  )
}