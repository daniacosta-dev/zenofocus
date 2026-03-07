import { useState, useEffect } from "react"
import { useTasks } from "../../store/useTasks"
import { useTimer } from "../../store/useTimer"
import type { Category } from "../../store/useTasks"
import { useT } from "../../hooks/useTranslation"
import type { DailySummary } from "../../store/useTasks"
import { i18n } from "../../i18n"

const CATEGORY_COLORS: Record<Category, string> = {
  trabajo: "#f59e0b",
  reunion: "#6366f1",
  admin: "#06b6d4",
  personal: "#22c55e",
}

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 11 }}>
        <span style={{ color: "#a1a1aa" }}>{label}</span>
        <span style={{ color }}>{value}h</span>
      </div>
      <div style={{ height: 4, background: "#1e1e2e", borderRadius: 2 }}>
        <div style={{
          height: "100%", width: `${pct}%`, background: color,
          borderRadius: 2, transition: "width 0.6s ease",
          boxShadow: `0 0 8px ${color}66`,
        }} />
      </div>
    </div>
  )
}

export default function Stats() {
  const { tasks, loadWeeklyHistory } = useTasks()
  const { pomosToday } = useTimer()
  const txt = useT()
  const doneTasks = tasks.filter((t) => t.done).length
  const totalTasks = tasks.length
  const focusHours = parseFloat((pomosToday * 25 / 60).toFixed(1))
  const [history, setHistory] = useState<DailySummary[]>([])
  const locale = txt === i18n.en ? "en-US" : "es-ES"
  const score = totalTasks === 0 ? 0 : Math.round(
    ((doneTasks / totalTasks) * 0.5 + Math.min(pomosToday / 8, 1) * 0.5) * 100
  )

  const scoreColor = score >= 80 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444"
  const scoreMsg = score >= 80
    ? txt.excellentDay
    : score >= 50
      ? txt.goodRhythm
      : txt.stillTime

  useEffect(() => {
    loadWeeklyHistory().then((h) => {
    // Reemplaza el día de hoy con datos en tiempo real
    const today = new Date().toISOString().split("T")[0]
    const filtered = h.filter(d => d.date !== today)
    const todaySummary: DailySummary = {
      date: today,
      pomosCompleted: pomosToday,
      tasksCompleted: tasks.filter(t => t.done).length,
      focusMinutes: pomosToday * 25,
    }
    setHistory([...filtered, todaySummary])
  })
  }, [tasks, pomosToday])

  // Horas por categoría
  const byCategory = (Object.keys(CATEGORY_COLORS) as Category[]).map((cat) => {
    const pomos = tasks
      .filter((t) => t.category === cat)
      .reduce((acc, t) => acc + t.pomos, 0)
    return { cat, hours: parseFloat((pomos * 25 / 60).toFixed(1)) }
  }).filter((c) => c.hours > 0)

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>

        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 24, letterSpacing: "-0.02em" }}>
          {txt.daySummary}
        </div>

        {/* Score card */}
        <div style={{
          background: "linear-gradient(135deg, #f59e0b10, #f9731610)",
          border: "1px solid #f59e0b22",
          borderRadius: 12, padding: "20px 24px",
          display: "flex", alignItems: "center", gap: 24,
          marginBottom: 20,
        }}>
          <div style={{ textAlign: "center", minWidth: 80 }}>
            <div style={{
              fontSize: 56, fontWeight: 800, color: scoreColor,
              letterSpacing: "-0.04em", lineHeight: 1,
            }}>
              {score}
            </div>
            <div style={{ fontSize: 10, color: "#52525b", marginTop: 4 }}>
              {txt.dayScore}
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: "#d4d4d8", marginBottom: 14 }}>
              {scoreMsg}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {[
                { label: txt.pomodoros, value: pomosToday, color: "#f59e0b" },
                { label: txt.tasksDone, value: doneTasks, color: "#22c55e" },
                { label: txt.focusHours, value: focusHours, color: "#6366f1" },
              ].map((stat) => (
                <div key={stat.label} style={{
                  background: "#0a0a14", borderRadius: 8, padding: "10px 12px",
                }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: stat.color }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: 10, color: "#52525b", marginTop: 2 }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Grid inferior */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>

          {/* Por categoría */}
          <div style={{
            background: "#0a0a14", border: "1px solid #12121e",
            borderRadius: 10, padding: "16px 18px",
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 14, color: "#a1a1aa" }}>
              {txt.timeByCategory}
            </div>
            {byCategory.length === 0 ? (
              <div style={{ fontSize: 12, color: "#3f3f46" }}>{txt.noData}</div>
            ) : (
              byCategory.map(({ cat, hours }) => (
                <Bar
                  key={cat}
                  label={txt[cat as keyof typeof txt] as string ?? cat}
                  value={hours}
                  max={8}
                  color={CATEGORY_COLORS[cat]}
                />
              ))
            )}
          </div>

          {/* Tareas completadas */}
          <div style={{
            background: "#0a0a14", border: "1px solid #12121e",
            borderRadius: 10, padding: "16px 18px",
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 12, color: "#a1a1aa" }}>
              {txt.completedTasks}
            </div>
            {tasks.filter((t) => t.done).length === 0 ? (
              <div style={{ fontSize: 12, color: "#3f3f46" }}>{txt.noDone}</div>
            ) : (
              tasks.filter((t) => t.done).map((t) => (
                <div key={t.id} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "6px 0", borderBottom: "1px solid #12121e",
                }}>
                  <span style={{ color: "#22c55e", fontSize: 12 }}>✓</span>
                  <span style={{ fontSize: 12, color: "#71717a", flex: 1 }}>{t.text}</span>
                  <span style={{ fontSize: 10, color: CATEGORY_COLORS[t.category] }}>
                    {txt[t.category as keyof typeof txt] as string ?? t.category}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Progreso del día */}
        <div style={{
          background: "#0a0a14", border: "1px solid #12121e",
          borderRadius: 10, padding: "16px 18px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#a1a1aa" }}>
              {txt.dayProgress}
            </span>
            <span style={{ fontSize: 11, color: "#52525b" }}>
              {doneTasks}/{totalTasks} {txt.tasks}
            </span>
          </div>
          <div style={{ height: 6, background: "#12121e", borderRadius: 3 }}>
            <div style={{
              height: "100%",
              width: totalTasks ? `${(doneTasks / totalTasks) * 100}%` : "0%",
              background: "linear-gradient(90deg, #f59e0b, #f97316)",
              borderRadius: 3, transition: "width 0.5s",
              boxShadow: "0 0 10px #f59e0b66",
            }} />
          </div>
        </div>

      </div>
      {/* Historial semanal */}
      <div style={{
        background: "#0a0a14", border: "1px solid #12121e",
        borderRadius: 10, padding: "16px 18px", marginTop: 16,
      }}>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 16, color: "#a1a1aa" }}>
          {txt.weeklyHistory}
        </div>
        {history.length === 0 ? (
          <div style={{ fontSize: 12, color: "#3f3f46" }}>
            Aún no hay historial. Completa tu primer pomodoro.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {history.slice().reverse().map((day) => {
              const date = new Date(day.date + "T12:00:00")
              const isToday = day.date === new Date().toISOString().split("T")[0]
              const maxPomos = Math.max(...history.map(h => h.pomosCompleted), 1)

              return (
                <div key={day.date} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 72, fontSize: 11, flexShrink: 0,
                    color: isToday ? "#f59e0b" : "#52525b",
                    fontWeight: isToday ? 700 : 400,
                  }}>
                    {isToday ? txt.today : date.toLocaleDateString(locale, { weekday: "short", day: "numeric" })}
                  </div>
                  <div style={{ flex: 1, height: 6, background: "#12121e", borderRadius: 3 }}>
                    <div style={{
                      height: "100%",
                      width: `${(day.pomosCompleted / maxPomos) * 100}%`,
                      background: isToday
                        ? "linear-gradient(90deg, #f59e0b, #f97316)"
                        : "#3f3f46",
                      borderRadius: 3,
                      transition: "width 0.5s",
                      boxShadow: isToday ? "0 0 6px #f59e0b66" : "none",
                    }} />
                  </div>
                  <div style={{ fontSize: 11, color: isToday ? "#f59e0b" : "#52525b", width: 20, textAlign: "right" }}>
                    {day.pomosCompleted}
                  </div>
                  <div style={{ fontSize: 10, color: "#3f3f46", width: 60 }}>
                    {day.tasksCompleted} {txt.tasks}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}