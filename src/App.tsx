import { useState, useEffect } from "react"
import { useTasks } from "./store/useTasks"
import Timer from "./components/Timer/Timer"
import Agenda from "./components/Agenda/Agenda"
import Stats from "./components/Stats/Stats"
import { useTrayTitle } from "./hooks/useTrayTitle"
import FinishModal from "./components/FinishModal/FinishModal"
import { useScheduledReminders } from "./hooks/useScheduledReminders"
import { useSettings } from "./store/useSettings"
import Settings from "./components/Settings/Settings"
import { useT } from "./hooks/useTranslation"
import { i18n } from "./i18n"
import { useWidgetSync } from "./hooks/useWidgetSync"
import { listen } from "@tauri-apps/api/event"
import { useTimer } from "./store/useTimer"
import icon from "./assets/icon.png"
import { invoke } from "@tauri-apps/api/core"

type View = "timer" | "agenda" | "stats" | "settings"

export default function App() {
  const [view, setView] = useState<View>("timer")
  const loadTasks = useTasks((s) => s.loadTasks)
  const loadSettings = useSettings((s) => s.loadSettings)
  useTrayTitle()
  useScheduledReminders()
  const txt = useT()
  const locale = txt === i18n.en ? "en-US" : "es-ES"
  const now = new Date()
  useWidgetSync()

  const TABS = [
    { id: "timer", icon: "⏱", label: txt.tabTimer },
    { id: "agenda", icon: "📋", label: txt.tabAgenda },
    { id: "stats", icon: "📊", label: txt.tabStats },
  ] as const

  useEffect(() => {
    loadTasks()
    loadSettings()
    const unlisten = listen("widget-toggle-timer", () => {
      const { running, setRunning } = useTimer.getState()
      setRunning(!running)
    })
    return () => { unlisten.then(f => f()) }
  }, [])

  const toggleWidget = async () => {
    await invoke("toggle_widget")
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="logo">
          <img
            src={icon}
            style={{ width: 28, height: 28, borderRadius: 6 }}
            alt="ZenoFocus"
          />
          <span className="logo-text">ZenoFocus</span>
        </div>

        <nav className="tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`tab-btn ${view === tab.id ? "active" : ""}`}
              onClick={() => setView(tab.id as View)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>

        <div className="date-display">
          {now.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" })}
        </div>
        <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
        <button
          onClick={toggleWidget}
          style={{
            background: "transparent",
            border: "1px solid #1e1e2e",
            color: "#52525b",
            width: 32, height: 32, borderRadius: 6,
            cursor: "pointer", fontSize: 14,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
          title="Widget"
        >
          ⚡
        </button>
        <button
          onClick={() => setView(view === "settings" ? "timer" : "settings")}
          style={{
            background: view === "settings" ? "#f59e0b22" : "transparent",
            border: `1px solid ${view === "settings" ? "#f59e0b" : "#1e1e2e"}`,
            color: view === "settings" ? "#f59e0b" : "#52525b",
            width: 32, height: 32, borderRadius: 6,
            cursor: "pointer", fontSize: 16,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
          title={txt.settings ?? "Configuración"}
        >
          ⚙️
        </button>
        </div>
      </header>

      <main className="main-content">
        {view === "timer" && <Timer />}
        {view === "agenda" && <Agenda />}
        {view === "stats" && <Stats />}
        {view === "settings" && <Settings />}
      </main>
      <FinishModal />
    </div>
  )
}