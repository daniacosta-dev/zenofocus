import { useState } from "react"
import { useTasks } from "../../store/useTasks"
import type { Category } from "../../store/useTasks"
import TaskSidebar from "../TaskSidebar/TaskSidebar"
import { useT } from "../../hooks/useTranslation"

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7) // 7am a 8pm
const HOUR_HEIGHT = 64

const CATEGORY_COLORS: Record<Category, string> = {
  trabajo: "#f59e0b",
  reunion: "#6366f1",
  admin: "#06b6d4",
  personal: "#22c55e",
}

interface NewTaskForm {
  hour: number
  minute: number
}

export default function Agenda() {
  const { tasks, addScheduledTask, toggleTask } = useTasks()
  const [form, setForm] = useState<NewTaskForm | null>(null)
  const [newText, setNewText] = useState("")
  const [newCategory, setNewCategory] = useState<Category>("trabajo")
  const txt = useT()

  const now = new Date()
  const currentHour = now.getHours() + now.getMinutes() / 60

  const scheduledTasks = tasks.filter(t => t.scheduledAt)

  const handleTimelineClick = (e: React.MouseEvent, hour: number) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top
    const minute = Math.floor((y / HOUR_HEIGHT) * 60 / 15) * 15 // snap a 15min
    setForm({ hour, minute })
    setNewText("")
    setNewCategory("trabajo")
  }

  const handleSave = async () => {
    if (!form || !newText.trim()) return
    const date = new Date()
    date.setHours(form.hour, form.minute, 0, 0)
    await addScheduledTask(newText.trim(), date.toISOString(), newCategory)
    setForm(null)
    setNewText("")
  }

  const getTasksForHour = (hour: number) => {
    return scheduledTasks.filter(t => {
      const d = new Date(t.scheduledAt!)
      return d.getHours() === hour
    })
  }

  return (
    <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

      {/* Timeline */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 0" }}>
        <div style={{ padding: "0 24px 16px", fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em" }}>
          {now.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
        </div>

        <div style={{ position: "relative" }}>
          {HOURS.map((h) => {
            const isNow = Math.floor(currentHour) === h
            const tasksHere = getTasksForHour(h)

            return (
              <div key={h} style={{ display: "flex", height: HOUR_HEIGHT }}>
                {/* Hora */}
                <div style={{
                  width: 52, flexShrink: 0, paddingTop: 2,
                  paddingRight: 12, textAlign: "right",
                  fontSize: 11, color: isNow ? "#f59e0b" : "#3f3f46",
                  fontWeight: isNow ? 700 : 400,
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {h}:00
                </div>

                {/* Área clickeable */}
                <div
                  onClick={(e) => handleTimelineClick(e, h)}
                  style={{
                    flex: 1, borderTop: `1px solid ${isNow ? "#f59e0b33" : "#12121e"}`,
                    position: "relative", cursor: "cell",
                    marginRight: 24,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f59e0b05")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  {/* Línea hora actual */}
                  {isNow && (
                    <div style={{
                      position: "absolute",
                      top: `${(currentHour % 1) * 100}%`,
                      left: 0, right: 0, height: 2,
                      background: "#f59e0b",
                      boxShadow: "0 0 8px #f59e0b",
                      zIndex: 2, pointerEvents: "none",
                    }} />
                  )}

                  {/* Tareas del bloque */}
                  {tasksHere.map((t) => {
                    const d = new Date(t.scheduledAt!)
                    const topPct = (d.getMinutes() / 60) * 100
                    return (
                      <div
                        key={t.id}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          position: "absolute",
                          top: `${topPct}%`,
                          left: 4, right: 4,
                          background: CATEGORY_COLORS[t.category] + "22",
                          border: `1px solid ${CATEGORY_COLORS[t.category]}66`,
                          borderLeft: `3px solid ${CATEGORY_COLORS[t.category]}`,
                          borderRadius: 4, padding: "3px 8px",
                          zIndex: 1, opacity: t.done ? 0.4 : 1,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: 11, color: CATEGORY_COLORS[t.category], fontWeight: 600 }}>
                            {d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })} — {t.text}
                          </span>
                          <div
                            onClick={() => toggleTask(t.id)}
                            style={{
                              width: 14, height: 14, borderRadius: 3, flexShrink: 0,
                              border: `1.5px solid ${t.done ? "#22c55e" : CATEGORY_COLORS[t.category]}`,
                              background: t.done ? "#22c55e" : "transparent",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 9, color: "#000", cursor: "pointer",
                            }}
                          >
                            {t.done ? "✓" : ""}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <TaskSidebar />
      {/* Modal de nueva tarea */}
      {form && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "#00000099",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            background: "#0f0f1a", border: "1px solid #1e1e2e",
            borderRadius: 14, padding: "24px 28px", minWidth: 320,
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
              {txt.newTask}
            </div>
            <div style={{ fontSize: 11, color: "#52525b", marginBottom: 16 }}>
              {`${String(form.hour).padStart(2, "0")}:${String(form.minute).padStart(2, "0")}`} — {txt.reminderNote}
            </div>

            <input
              autoFocus
              value={newText}
              onChange={e => setNewText(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSave()}
              placeholder={txt.taskName}
              style={{
                width: "100%", background: "#12121e", border: "1px solid #1e1e2e",
                color: "#e4e4f0", padding: "8px 12px", borderRadius: 6,
                fontSize: 12, outline: "none", marginBottom: 12,
              }}
            />

            {/* Ajuste de hora */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 11, color: "#52525b" }}>{txt.time}:</span>
              <input
                type="number" min={0} max={23} value={form.hour}
                onChange={e => setForm({ ...form, hour: parseInt(e.target.value) || 0 })}
                style={{
                  width: 50, background: "#12121e", border: "1px solid #1e1e2e",
                  color: "#e4e4f0", padding: "4px 8px", borderRadius: 4,
                  fontSize: 12, outline: "none", textAlign: "center",
                }}
              />
              <span style={{ color: "#52525b" }}>:</span>
              <input
                type="number" min={0} max={59} step={15} value={form.minute}
                onChange={e => setForm({ ...form, minute: parseInt(e.target.value) || 0 })}
                style={{
                  width: 50, background: "#12121e", border: "1px solid #1e1e2e",
                  color: "#e4e4f0", padding: "4px 8px", borderRadius: 4,
                  fontSize: 12, outline: "none", textAlign: "center",
                }}
              />
            </div>

            {/* Categoría */}
            <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
              {(Object.keys(CATEGORY_COLORS) as Category[]).map((cat) => (
                <button key={cat} onClick={() => setNewCategory(cat)} style={{
                  flex: 1,
                  background: newCategory === cat ? CATEGORY_COLORS[cat] + "22" : "transparent",
                  border: `1px solid ${newCategory === cat ? CATEGORY_COLORS[cat] : "#1e1e2e"}`,
                  color: newCategory === cat ? CATEGORY_COLORS[cat] : "#52525b",
                  padding: "4px 0", borderRadius: 4, fontSize: 10, cursor: "pointer",
                }}>
                  {txt[cat as keyof typeof txt] as string ?? cat}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setForm(null)} style={{
                flex: 1, background: "transparent", border: "1px solid #1e1e2e",
                color: "#71717a", padding: "8px", borderRadius: 6,
                fontSize: 12, cursor: "pointer",
              }}>
                {txt.cancel}
              </button>
              <button onClick={handleSave} style={{
                flex: 1, background: "#f59e0b", border: "none",
                color: "#000", padding: "8px", borderRadius: 6,
                fontSize: 12, cursor: "pointer", fontWeight: 700,
              }}>
                {txt.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}