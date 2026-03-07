import { useEffect, useRef } from "react"
import { useTasks } from "../store/useTasks"
import { notify } from "./useNotification"

export function useScheduledReminders() {
  const { tasks } = useTasks()
  const notifiedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()

      tasks.forEach((task) => {
        if (!task.scheduledAt || task.done) return
        if (notifiedRef.current.has(task.id)) return

        const scheduled = new Date(task.scheduledAt)
        const diffMs = scheduled.getTime() - now.getTime()
        const diffMin = diffMs / 1000 / 60

        // Notifica entre 10 y 11 minutos antes
        if (diffMin <= 10 && diffMin > 0) {
          notifiedRef.current.add(task.id)
          notify(
            `⏰ En 10 minutos: ${task.text}`,
            `Programado para las ${scheduled.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}`
          )
        }

        // Notifica justo a la hora (±1 min)
        if (diffMin <= 0 && diffMin > -1) {
          const keyNow = `${task.id}-now`
          if (!notifiedRef.current.has(keyNow)) {
            notifiedRef.current.add(keyNow)
            notify(
              `🔔 Ahora: ${task.text}`,
              `Es la hora de esta tarea.`
            )
          }
        }
      })
    }, 30000) // revisa cada 30 segundos

    return () => clearInterval(interval)
  }, [tasks])
}