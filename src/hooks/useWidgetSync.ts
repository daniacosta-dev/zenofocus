import { useEffect } from "react"
import { emit } from "@tauri-apps/api/event"
import { useTimer } from "../store/useTimer"
import { useTasks } from "../store/useTasks"

export function useWidgetSync() {
  const { mode, timeLeft, running } = useTimer()
  const { tasks, activeTaskId } = useTasks()

  useEffect(() => {
    const activeTask = tasks.find(t => t.id === activeTaskId)
    emit("timer-state", {
      mode,
      timeLeft,
      running,
      activeTask: activeTask?.text ?? null,
    }).catch(() => {})
  }, [mode, timeLeft, running, activeTaskId, tasks])
}