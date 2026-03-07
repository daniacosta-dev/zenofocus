import { create } from "zustand"
import { notify } from "../hooks/useNotification"
import { useSettings } from "./useSettings"
import { playFinishSound } from "../hooks/useSound"

export type TimerMode = "work" | "shortBreak" | "longBreak"

export function getDurations() {
    const { workDuration, shortBreak, longBreak } = useSettings.getState().settings
    return {
        work: workDuration * 60,
        shortBreak: shortBreak * 60,
        longBreak: longBreak * 60,
    }
}

export const DURATIONS = {
    work: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
}

interface TimerStore {
    mode: TimerMode
    timeLeft: number
    running: boolean
    pomosToday: number
    justFinished: boolean
    setMode: (mode: TimerMode) => void
    setRunning: (running: boolean) => void
    tick: () => void
    reset: () => void
    finishPomo: () => void
    clearFinished: () => void
}

export const useTimer = create<TimerStore>((set, get) => ({
    mode: "work",
    timeLeft: DURATIONS.work,
    running: false,
    pomosToday: 0,
    justFinished: false,
    clearFinished: () => set({ justFinished: false }),

    setRunning: (running) => set({ running }),

    tick: () => {
        const { timeLeft, finishPomo } = get()
        if (timeLeft <= 1) {
            finishPomo()
        } else {
            set({ timeLeft: timeLeft - 1 })
        }
    },

    setMode: (mode) => {
        const durations = getDurations()
        set({ mode, timeLeft: durations[mode], running: false })
    },

    reset: () => {
        const { mode } = get()
        const durations = getDurations()
        set({ timeLeft: durations[mode], running: false })
    },

    finishPomo: async () => {
  const { mode, pomosToday } = get()
  const isWork = mode === "work"
  const { autoStartBreak, autoStartWork, pomosBeforeLong, soundEnabled, language } = useSettings.getState().settings
  
   const newPomos = isWork ? pomosToday + 1 : pomosToday
  const durations = getDurations()

  // Calcular siguiente modo
  let nextMode: TimerMode = "work"
  if (isWork) {
    nextMode = newPomos % pomosBeforeLong === 0 ? "longBreak" : "shortBreak"
  } else {
    nextMode = "work"
  }

  const shouldAutoStart = isWork ? autoStartBreak : autoStartWork

  if (shouldAutoStart) {
    // Cambia modo y arranca automáticamente sin modal
    set({
      running: true,
      timeLeft: durations[nextMode],
      mode: nextMode,
      pomosToday: newPomos,
      justFinished: false,
    })
  } else {
    // Muestra modal y espera confirmación
    set({
      running: false,
      pomosToday: newPomos,
      justFinished: true,
    })
  }

  if (soundEnabled) {
    playFinishSound()
  }

  const messages = {
    es: {
      workTitle: "🍅 ¡Pomodoro completado!",
      workBody: "Tómate un descanso.",
      breakTitle: "⚡ ¡Descanso terminado!",
      breakBody: "Hora de volver al foco.",
    },
    en: {
      workTitle: "🍅 Pomodoro completed!",
      workBody: "Take a break.",
      breakTitle: "⚡ Break finished!",
      breakBody: "Time to get back to focus.",
    },
  }

  const m = messages[language]

  if (isWork) {
    await notify(m.workTitle, m.workBody)
    const newPomosToday = get().pomosToday
    setTimeout(async () => {
      const { useTasks } = await import("./useTasks")
      useTasks.getState().saveDailySummary(newPomosToday)
    }, 500)
  } else {
    await notify(m.breakTitle, m.breakBody)
  }
},
}))