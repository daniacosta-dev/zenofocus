import { useEffect, useState } from "react"
import { listen } from "@tauri-apps/api/event"
import { emit } from "@tauri-apps/api/event"
import { getCurrentWindow } from "@tauri-apps/api/window"
import { useSettings } from "../../store/useSettings"
import { useT } from "../../hooks/useTranslation"

type Mode = "work" | "shortBreak" | "longBreak"

const MODE_COLOR: Record<Mode, string> = {
  work: "#f59e0b",
  shortBreak: "#22c55e",
  longBreak: "#6366f1",
}

const MODE_DURATIONS: Record<Mode, number> = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
}

function fmt(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, "0")
  const ss = (s % 60).toString().padStart(2, "0")
  return `${m}:${ss}`
}

interface TimerState {
  mode: Mode
  timeLeft: number
  running: boolean
  activeTask: string | null
}

export default function Widget() {
  const loadSettings = useSettings((s) => s.loadSettings)
  const txt = useT()
  const [state, setState] = useState<TimerState>({
    mode: "work",
    timeLeft: 25 * 60,
    running: false,
    activeTask: null,
  })

  const MODE_LABEL: Record<Mode, string> = {
    work: txt.focus,
    shortBreak: txt.shortBreak,
    longBreak: txt.longBreak,
  }

  useEffect(() => {
    loadSettings()
  }, [])

  useEffect(() => {
    const unlisten = listen<TimerState>("timer-state", (e) => {
      setState(e.payload)
    })
    return () => { unlisten.then(f => f()) }
  }, [])

  const { mode, timeLeft, running, activeTask } = state
  const color = MODE_COLOR[mode]
  const duration = MODE_DURATIONS[mode]
  const progress = timeLeft / duration

  const toggleTimer = () => {
    emit("widget-toggle-timer", {})
  }

  const handleDrag = async () => {
    const win = getCurrentWindow()
    await win.startDragging()
  }

  const hideWidget = async () => {
    console.log("hideWidget llamado")
  const win = getCurrentWindow()
  console.log("win:", win)
  await win.hide()
  }

  return (
    <div
      onMouseDown={handleDrag}
      style={{
        position: "relative",
        width: 280, height: 100,
        background: "#0a0a14ee",
        border: `1px solid ${color}44`,
        borderRadius: 14,
        display: "flex", alignItems: "center",
        padding: "0 16px", gap: 12,
        cursor: "grab",
        backdropFilter: "blur(12px)",
        boxShadow: `0 4px 24px #00000066, 0 0 0 1px ${color}22`,
        userSelect: "none",
      }}
    >
      <button
        onMouseDown={e => e.stopPropagation()}
        onClick={hideWidget}
        style={{
          position: "absolute",
          top: 6, right: 8,
          background: "transparent", border: "none",
          color: "#3f3f46", cursor: "pointer",
          fontSize: 14, lineHeight: 1,
          padding: "2px 4px",
          transition: "color 0.15s",
        }}
        onMouseEnter={e => (e.currentTarget.style.color = "#ef4444")}
        onMouseLeave={e => (e.currentTarget.style.color = "#3f3f46")}
      >
        ×
      </button>
      {/* Progress ring */}
      <div style={{ position: "relative", width: 52, height: 52, flexShrink: 0 }}>
        <svg width="52" height="52" viewBox="0 0 52 52">
          <circle cx="26" cy="26" r="22" fill="none" stroke="#1a1a2e" strokeWidth="4" />
          <circle
            cx="26" cy="26" r="22"
            fill="none" stroke={color} strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 22 * progress} ${2 * Math.PI * 22}`}
            transform="rotate(-90 26 26)"
            style={{ transition: "stroke-dasharray 0.5s ease" }}
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 700, color,
          fontVariantNumeric: "tabular-nums",
          fontFamily: "monospace",
        }}>
          {fmt(timeLeft)}
        </div>
      </div>

      {/* Info */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        <div style={{
          fontSize: 11, color: "#52525b", marginBottom: 3,
          textTransform: "uppercase", letterSpacing: "0.06em",
        }}>
          {MODE_LABEL[mode]}
        </div>
        <div style={{
          fontSize: 12, color: "#d4d4d8",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {activeTask ? `🎯 ${activeTask}` : `🎯 ${txt.noTaskSelected}`}
        </div>
      </div>

      {/* Play/Pause */}
      <button
        onMouseDown={e => e.stopPropagation()}
        onClick={toggleTimer}
        style={{
          width: 36, height: 36, borderRadius: "50%",
          background: color, border: "none",
          color: "#000", fontSize: 14, fontWeight: 700,
          cursor: "pointer", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 0 12px ${color}66`,
        }}
      >
        {running ? "⏸" : "▶"}
      </button>
    </div>
  )
}