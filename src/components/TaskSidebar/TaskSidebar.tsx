import { useState } from "react"
import { useTasks } from "../../store/useTasks"
import type { Category } from "../../store/useTasks"
import ConfirmModal from "../ConfirmModal/ConfirmModal"
import { useT } from "../../hooks/useTranslation"
import { useTimer } from "../../store/useTimer"

const CATEGORY_COLORS: Record<Category, string> = {
    trabajo: "#f59e0b",
    reunion: "#6366f1",
    admin: "#06b6d4",
    personal: "#22c55e",
}

export default function TaskSidebar() {
    const { tasks, activeTaskId, addTask, toggleTask, setActiveTask, deleteTask, saveDailySummary, updateTask } = useTasks()
    const [newTask, setNewTask] = useState("")
    const [newCategory, setNewCategory] = useState<Category>("trabajo")
    const [confirmTask, setConfirmTask] = useState<string | null>(null)
    const [newPomos, setNewPomos] = useState(1)
    const [unconfirmTask, setUnconfirmTask] = useState<string | null>(null)
    const [editingTask, setEditingTask] = useState<string | null>(null)
    const [editText, setEditText] = useState("")
    const txt = useT()

    const activeTask = tasks.find(t => t.id === activeTaskId)

    const handleAddTask = async () => {
        if (!newTask.trim()) return
        await addTask(newTask.trim(), newCategory, newPomos)
        setNewTask("")
        setNewPomos(1)
    }

    return (
        <>
            <div style={{
                width: 280, borderLeft: "1px solid #12121e",
                background: "#0a0a14", display: "flex", flexDirection: "column",
                flexShrink: 0,
            }}>

                {/* Tarea activa */}
                <div style={{
                    padding: "14px 16px 8px", fontSize: 11,
                    color: "#52525b", letterSpacing: "0.08em", textTransform: "uppercase",
                }}>
                    {txt.activeTask}
                </div>

                {activeTask ? (
                    <div style={{
                        margin: "0 12px 12px",
                        background: "#f59e0b11", border: "1px solid #f59e0b44",
                        borderRadius: 8, padding: "10px 12px",
                    }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 12, fontWeight: 600, color: "#fbbf24", marginBottom: 4 }}>
                                    {activeTask.text}
                                </div>
                                <div style={{ fontSize: 10, color: "#92400e" }}>
                                    {activeTask.scheduledAt && (
                                        <span style={{ color: "#a5b4fc", marginRight: 6 }}>
                                            🕐 {new Date(activeTask.scheduledAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                    )}
                                    🍅 {activeTask.pomos} {txt.pomosEstimated}
                                </div>
                            </div>
                            <button
                                onClick={() => setConfirmTask(activeTask.id)}
                                style={{
                                    background: "transparent", border: "1px solid #f59e0b44",
                                    color: "#f59e0b", width: 24, height: 24, borderRadius: 4,
                                    fontSize: 11, cursor: "pointer", flexShrink: 0,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                }}
                                title="Marcar como completada"
                            >

                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={{
                        margin: "0 12px 12px", fontSize: 12,
                        color: "#3f3f46", padding: "8px",
                    }}>
                        {txt.selectTask}
                    </div>
                )}

                {/* Cola del día */}
                <div style={{
                    padding: "0 16px 8px", fontSize: 11,
                    color: "#52525b", letterSpacing: "0.08em", textTransform: "uppercase",
                }}>
                    {txt.queue}
                </div>

                <div style={{ flex: 1, overflowY: "auto", padding: "0 12px" }}>
                    {tasks.length === 0 && (
                        <div style={{ fontSize: 12, color: "#3f3f46", padding: "12px 8px" }}>
                            {txt.firstTask}
                        </div>
                    )}
                    {tasks.filter(t => t.id !== activeTaskId && !t.done).map((t) => (
                        <div
                            key={t.id}
                            onClick={() => editingTask !== t.id && setActiveTask(t.id)}
                            style={{
                                display: "flex", alignItems: "flex-start", gap: 8,
                                padding: "8px", borderRadius: 6, marginBottom: 2,
                                cursor: "pointer", opacity: t.done ? 0.45 : 1,
                                transition: "all 0.15s",
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = "#12121e"
                                e.currentTarget.querySelectorAll<HTMLElement>(".task-action").forEach(b => b.style.opacity = "1")
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = "transparent"
                                e.currentTarget.querySelectorAll<HTMLElement>(".task-action").forEach(b => b.style.opacity = "0")
                            }}
                        >
                            <div
                                onClick={(e) => {
                                    e.stopPropagation()
                                    if (!t.done) {
                                        setConfirmTask(t.id)
                                    } else {
                                        setUnconfirmTask(t.id)
                                    }
                                }}
                                style={{
                                    width: 16, height: 16, borderRadius: 4, flexShrink: 0, marginTop: 1,
                                    border: `1.5px solid ${t.done ? "#22c55e" : "#3f3f46"}`,
                                    background: t.done ? "#22c55e" : "transparent",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 10, color: "#000",
                                }}
                            >
                                {t.done ? "✓" : ""}
                            </div>

                            <div style={{ flex: 1 }}>
                                {editingTask === t.id ? (
                                    <input
                                        autoFocus
                                        value={editText}
                                        onChange={e => setEditText(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === "Enter") { updateTask(t.id, editText); setEditingTask(null) }
                                            if (e.key === "Escape") setEditingTask(null)
                                        }}
                                        onBlur={() => { updateTask(t.id, editText); setEditingTask(null) }}
                                        onClick={e => e.stopPropagation()}
                                        style={{
                                            background: "#1e1e2e", border: "1px solid #f59e0b44",
                                            color: "#e4e4f0", padding: "2px 6px", borderRadius: 4,
                                            fontSize: 12, outline: "none", width: "100%",
                                        }}
                                    />
                                ) : (
                                    <div style={{ fontSize: 12, color: "#d4d4d8" }}>{t.text}</div>
                                )}
                                <div style={{ fontSize: 10, color: CATEGORY_COLORS[t.category] || "#52525b", marginTop: 2 }}>
                                    {t.scheduledAt && (
                                        <span style={{ color: "#6366f1", marginRight: 6 }}>
                                            🕐 {new Date(t.scheduledAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                    )}
                                    {String(txt[t.category as keyof typeof txt] ?? t.category)} · 🍅 {t.pomos}
                                </div>
                            </div>

                            <button
                                className="task-action"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setEditingTask(t.id)
                                    setEditText(t.text)
                                }}
                                style={{
                                    background: "transparent", border: "none",
                                    color: "#a1a1aa", cursor: "pointer",
                                    fontSize: 12, padding: "0 2px",
                                    opacity: 0, transition: "opacity 0.15s",
                                    flexShrink: 0,
                                }}
                            >
                                ✏️
                            </button>

                            <button
                                className="task-action"
                                onClick={(e) => { e.stopPropagation(); deleteTask(t.id) }}
                                style={{
                                    background: "transparent", border: "none",
                                    color: "#ef4444", cursor: "pointer",
                                    fontSize: 14, padding: "0 2px",
                                    opacity: 0, transition: "opacity 0.15s",
                                    flexShrink: 0,
                                }}
                            >
                                ×
                            </button>
                        </div>
                    ))}

                    {/* Tareas completadas al fondo */}
                    {tasks.filter(t => t.done).length > 0 && (
                        <div style={{
                            fontSize: 10, color: "#3f3f46",
                            padding: "8px 8px 4px",
                            letterSpacing: "0.06em", textTransform: "uppercase",
                            marginTop: 8,
                        }}>
                            {txt.completed}
                        </div>
                    )}
                    {tasks.filter(t => t.done && t.id !== activeTaskId).map((t) => (
                        <div
                            key={t.id}
                            style={{
                                display: "flex", alignItems: "flex-start", gap: 8,
                                padding: "8px", borderRadius: 6, marginBottom: 2,
                                opacity: 0.4,
                            }}
                        >
                            <div
                                onClick={() => setUnconfirmTask(t.id)}
                                style={{
                                    width: 16, height: 16, borderRadius: 4, flexShrink: 0, marginTop: 1,
                                    border: "1.5px solid #22c55e",
                                    background: "#22c55e",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 10, color: "#000", cursor: "pointer",
                                }}
                            >
                                ✓
                            </div>
                            <div style={{
                                fontSize: 12, textDecoration: "line-through",
                                color: "#52525b", flex: 1,
                            }}>
                                {t.text}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input nueva tarea */}
                <div style={{ padding: 12, borderTop: "1px solid #12121e" }}>
                    <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                        <input
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                            placeholder={txt.addTask}
                            style={{
                                flex: 1, background: "#12121e", border: "1px solid #1e1e2e",
                                color: "#e4e4f0", padding: "6px 10px", borderRadius: 6,
                                fontSize: 12, outline: "none",
                            }}
                        />
                        <button onClick={handleAddTask} style={{
                            background: "#f59e0b", border: "none", color: "#000",
                            width: 30, height: 30, borderRadius: 6, fontSize: 18, fontWeight: 700,
                        }}>+</button>
                    </div>

                    {/* Pomodoros estimados */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                        <span style={{ fontSize: 10, color: "#52525b" }}>🍅 Pomodoros:</span>
                        <div style={{ display: "flex", gap: 3 }}>
                            {[1, 2, 3, 4, 5].map((n) => (
                                <button
                                    key={n}
                                    onClick={() => setNewPomos(n)}
                                    style={{
                                        width: 22, height: 22,
                                        background: newPomos >= n ? "#f59e0b22" : "transparent",
                                        border: `1px solid ${newPomos >= n ? "#f59e0b" : "#1e1e2e"}`,
                                        color: newPomos >= n ? "#f59e0b" : "#52525b",
                                        borderRadius: 4, fontSize: 10, cursor: "pointer",
                                    }}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Selector de categoría */}
                    <div style={{ display: "flex", gap: 4 }}>
                        {(["trabajo", "reunion", "admin", "personal"] as Category[]).map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setNewCategory(cat)}
                                style={{
                                    flex: 1,
                                    background: newCategory === cat ? CATEGORY_COLORS[cat] + "22" : "transparent",
                                    border: `1px solid ${newCategory === cat ? CATEGORY_COLORS[cat] : "#1e1e2e"}`,
                                    color: newCategory === cat ? CATEGORY_COLORS[cat] : "#52525b",
                                    padding: "3px 0", borderRadius: 4,
                                    fontSize: 10, cursor: "pointer",
                                    transition: "all 0.15s",
                                }}
                            >
                                {String(txt[cat as keyof typeof txt] ?? cat)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {confirmTask && (
                <ConfirmModal
                    text={tasks.find(t => t.id === confirmTask)?.text ?? ""}
                    onConfirm={() => {
                        toggleTask(confirmTask)
                        const { pomosToday } = useTimer.getState()
                        saveDailySummary(pomosToday)
                        setConfirmTask(null)
                    }}
                    onCancel={() => setConfirmTask(null)}
                />
            )}
            {unconfirmTask && (
                <ConfirmModal
                    text={tasks.find(t => t.id === unconfirmTask)?.text ?? ""}
                    unmark={true}
                    onConfirm={() => {
                        toggleTask(unconfirmTask)
                        setUnconfirmTask(null)
                    }}
                    onCancel={() => setUnconfirmTask(null)}
                />
            )}
        </>
    )
}