import { useTasks } from "../../store/useTasks"
import { useTimer } from "../../store/useTimer"
import { useT } from "../../hooks/useTranslation"

export default function FinishModal() {
  const { justFinished, clearFinished, mode, setMode, pomosToday } = useTimer()
  const { saveDailySummary } = useTasks()
  const txt = useT()

  if (!justFinished) return null

  const isWork = mode === "work"

  const handleBreak = () => {
    saveDailySummary(pomosToday)
    setMode("shortBreak")
    clearFinished()
  }

  const handleLongBreak = () => {
    saveDailySummary(pomosToday)
    setMode("longBreak")
    clearFinished()
  }

  const handleContinue = () => {
    saveDailySummary(pomosToday)
    setMode("work")
    clearFinished()
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "#00000099",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: "#0f0f1a",
        border: "1px solid #1e1e2e",
        borderRadius: 14, padding: "32px 36px",
        minWidth: 320, textAlign: "center",
      }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>
          {isWork ? "🍅" : "⚡"}
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#f4f4f5", marginBottom: 8 }}>
          {isWork ? txt.pomodoroCompletedTitle : txt.breakCompletedBody}
        </div>
        <div style={{ fontSize: 12, color: "#71717a", marginBottom: 28 }}>
          {isWork
            ? txt.pomodoroCompletedBody
            : txt.breakCompletedBody}
        </div>

        {isWork ? (
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <button onClick={handleBreak} style={{
              background: "#22c55e22", border: "1px solid #22c55e44",
              color: "#22c55e", padding: "8px 18px", borderRadius: 6,
              fontSize: 12, cursor: "pointer", fontWeight: 600,
            }}>
              ☕ {txt.shortBreak}
            </button>
            <button onClick={handleLongBreak} style={{
              background: "#6366f122", border: "1px solid #6366f144",
              color: "#a5b4fc", padding: "8px 18px", borderRadius: 6,
              fontSize: 12, cursor: "pointer", fontWeight: 600,
            }}>
              🛋 {txt.longBreak}
            </button>
            <button onClick={handleContinue} style={{
              background: "#f59e0b22", border: "1px solid #f59e0b44",
              color: "#f59e0b", padding: "8px 18px", borderRadius: 6,
              fontSize: 12, cursor: "pointer", fontWeight: 600,
            }}>
              ▶ {txt.focus}
            </button>
          </div>
        ) : (
          <button onClick={handleContinue} style={{
            background: "#f59e0b", border: "none",
            color: "#000", padding: "10px 32px", borderRadius: 6,
            fontSize: 13, cursor: "pointer", fontWeight: 700,
          }}>
            ▶ {txt.focus}
          </button>
        )}
      </div>
    </div>
  )
}