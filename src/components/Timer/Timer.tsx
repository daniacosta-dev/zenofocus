import { useState } from "react"
import { useTimer, DURATIONS } from "../../store/useTimer"
import { useTasks } from "../../store/useTasks"
import ConfirmModal from "../ConfirmModal/ConfirmModal"
import TaskSidebar from "../TaskSidebar/TaskSidebar"
import { useT } from "../../hooks/useTranslation"
import { useSettings } from "../../store/useSettings"

type Mode = "work" | "shortBreak" | "longBreak"

const MODE_COLOR: Record<Mode, string> = {
    work: "#f59e0b",
    shortBreak: "#22c55e",
    longBreak: "#6366f1",
}

function fmt(s: number) {
    const m = Math.floor(s / 60).toString().padStart(2, "0")
    const ss = (s % 60).toString().padStart(2, "0")
    return `${m}:${ss}`
}

function CircleTimer({ progress, mode }: { progress: number; mode: Mode }) {
    const r = 76
    const circ = 2 * Math.PI * r
    const dash = circ * progress
    const color = MODE_COLOR[mode]

    return (
        <svg width="180" height="180" viewBox="0 0 180 180">
            <defs>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            <circle cx="90" cy="90" r={r} fill="none" stroke="#1a1a2e" strokeWidth="8" />
            <circle
                cx="90" cy="90" r={r}
                fill="none"
                stroke={color}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${dash} ${circ}`}
                transform="rotate(-90 90 90)"
                filter="url(#glow)"
                style={{ transition: "stroke-dasharray 0.5s ease" }}
            />
        </svg>
    )
}

export default function Timer() {
    const { mode, timeLeft, running, pomosToday, setMode, setRunning, reset } = useTimer()
    const { tasks, activeTaskId, toggleTask } = useTasks()
    const [confirmTask, setConfirmTask] = useState<string | null>(null)
    const [showNoTaskModal, setShowNoTaskModal] = useState(false)
    const [pendingMode, setPendingMode] = useState<Mode | null>(null)
    const { settings } = useSettings()
    const txt = useT()

    const duration = DURATIONS[mode]
    const progress = timeLeft / duration
    const color = MODE_COLOR[mode]
    const activeTask = tasks.find((t) => t.id === activeTaskId)

    const MODE_LABEL: Record<Mode, string> = {
        work: txt.focus,
        shortBreak: txt.shortBreak,
        longBreak: txt.longBreak,
    }

    const handleModeChange = (newMode: Mode) => {
  const fullDurations: Record<Mode, number> = {
    work:       settings.workDuration * 60,
    shortBreak: settings.shortBreak * 60,
    longBreak:  settings.longBreak * 60,
  }

  const hasStarted = timeLeft < fullDurations[mode]

  if (hasStarted && newMode !== mode) {
    setPendingMode(newMode)
  } else {
    setMode(newMode)
  }
}

    return (
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

            {/* Timer central */}
            <div style={{
                flex: 1, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 24, padding: 40,
            }}>

                {/* Mode selector */}
                <div style={{ display: "flex", gap: 6 }}>
                    {(Object.keys(DURATIONS) as Mode[]).map((m) => (
                        <button key={m} onClick={() => handleModeChange(m)} style={{
                            background: mode === m ? MODE_COLOR[m] + "22" : "transparent",
                            border: `1px solid ${mode === m ? MODE_COLOR[m] : "#1e1e2e"}`,
                            color: mode === m ? MODE_COLOR[m] : "#52525b",
                            padding: "5px 14px", borderRadius: 20,
                            fontSize: 11, cursor: "pointer",
                            transition: "all 0.2s",
                        }}>
                            {MODE_LABEL[m]}
                        </button>
                    ))}
                </div>

                {/* Circle */}
                <div style={{ position: "relative", width: 180, height: 180 }}>
                    <CircleTimer progress={progress} mode={mode} />
                    <div style={{
                        position: "absolute", inset: 0,
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center",
                    }}>
                        <div style={{
                            fontSize: 38, fontWeight: 700,
                            letterSpacing: "-0.04em",
                            color, fontVariantNumeric: "tabular-nums",
                        }}>
                            {fmt(timeLeft)}
                        </div>
                        <div style={{ fontSize: 11, color: "#52525b", marginTop: 2 }}>
                            {MODE_LABEL[mode]}
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <button onClick={reset} style={{
                        background: "#12121e", border: "1px solid #1e1e2e",
                        color: "#52525b", width: 36, height: 36,
                        borderRadius: "50%", fontSize: 16,
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>↺</button>

                    <button onClick={() => {
                        if (!running && !activeTaskId && mode === "work") {
                            setShowNoTaskModal(true)
                            return
                        }
                        setRunning(!running)
                    }} style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: color, border: "none", color: "#000",
                        width: 54, height: 54, borderRadius: "50%",
                        fontSize: 20, fontWeight: 700,
                        boxShadow: `0 0 24px ${color}66`,
                        transition: "transform 0.1s",
                    }}>
                        {running ? "⏸" : "▶"}
                    </button>

                    <button onClick={() => setMode(mode === "work" ? "shortBreak" : "work")} style={{
                        background: "#12121e", border: "1px solid #1e1e2e",
                        color: "#52525b", width: 36, height: 36,
                        borderRadius: "50%", fontSize: 14,
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>⏭</button>
                </div>

                {/* Pomodoro dots */}
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} style={{
                            width: 10, height: 10, borderRadius: "50%",
                            background: i < pomosToday ? color : "#1e1e2e",
                            boxShadow: i < pomosToday ? `0 0 6px ${color}88` : "none",
                            transition: "all 0.3s",
                        }} />
                    ))}
                    <span style={{ fontSize: 11, color: "#52525b", marginLeft: 4 }}>
                        {pomosToday} {txt.today}
                    </span>
                </div>

                {/* Tarea activa */}
                {activeTask && (
                    <div style={{
                        background: "#f59e0b11", border: "1px solid #f59e0b33",
                        borderRadius: 8, padding: "10px 16px",
                        fontSize: 12, color: "#fbbf24", maxWidth: 320, textAlign: "center",
                    }}>
                        🎯 {txt.activeTask}
                    </div>
                )}
            </div>

            <TaskSidebar />
            {confirmTask && (
                <ConfirmModal
                    text={tasks.find(t => t.id === confirmTask)?.text ?? ""}
                    onConfirm={() => {
                        toggleTask(confirmTask)
                        setConfirmTask(null)
                    }}
                    onCancel={() => setConfirmTask(null)}
                />
            )}
            {showNoTaskModal && (
                <div style={{
                    position: "fixed", inset: 0, zIndex: 1000,
                    background: "#00000099",
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <div style={{
                        background: "#0f0f1a", border: "1px solid #1e1e2e",
                        borderRadius: 14, padding: "28px 32px",
                        minWidth: 300, textAlign: "center",
                    }}>
                        <div style={{ fontSize: 32, marginBottom: 12 }}>🎯</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#f4f4f5", marginBottom: 8 }}>
                            {txt.noTaskSelected}
                        </div>
                        <div style={{ fontSize: 12, color: "#71717a", marginBottom: 24 }}>
                            {txt.noTaskMsg}
                        </div>
                        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                            <button onClick={() => setShowNoTaskModal(false)} style={{
                                background: "transparent", border: "1px solid #1e1e2e",
                                color: "#71717a", padding: "7px 20px", borderRadius: 6,
                                fontSize: 12, cursor: "pointer",
                            }}>
                                {txt.cancel}
                            </button>
                            <button onClick={() => {
                                setShowNoTaskModal(false)
                                setRunning(true)
                            }} style={{
                                background: "#f59e0b", border: "none",
                                color: "#000", padding: "7px 20px", borderRadius: 6,
                                fontSize: 12, cursor: "pointer", fontWeight: 600,
                            }}>
                                {txt.startAnyway}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {pendingMode && (
                <div style={{
                    position: "fixed", inset: 0, zIndex: 1000,
                    background: "#00000088",
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <div style={{
                        background: "#0f0f1a", border: "1px solid #1e1e2e",
                        borderRadius: 12, padding: "24px 28px",
                        minWidth: 300, textAlign: "center",
                    }}>
                        <div style={{ fontSize: 20, marginBottom: 12 }}>⚠️</div>
                        <div style={{ fontSize: 14, color: "#e4e4f0", marginBottom: 8 }}>
                            {txt.resetWarningTitle}
                        </div>
                        <div style={{ fontSize: 12, color: "#71717a", marginBottom: 24 }}>
                            {txt.resetWarningBody}
                        </div>
                        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                            <button
                                onClick={() => setPendingMode(null)}
                                style={{
                                    background: "transparent", border: "1px solid #1e1e2e",
                                    color: "#71717a", padding: "7px 20px", borderRadius: 6,
                                    fontSize: 12, cursor: "pointer",
                                }}
                            >
                                {txt.cancel}
                            </button>
                            <button
                                onClick={() => {
                                    setMode(pendingMode)
                                    setRunning(false)
                                    setPendingMode(null)
                                }}
                                style={{
                                    background: "#f59e0b", border: "none",
                                    color: "#000", padding: "7px 20px", borderRadius: 6,
                                    fontSize: 12, cursor: "pointer", fontWeight: 700,
                                }}
                            >
                                {txt.resetConfirm}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}