import { create } from "zustand"
import { load } from "@tauri-apps/plugin-store"

export type Language = "es" | "en"

export interface Settings {
  workDuration: number      // minutos
  shortBreak: number
  longBreak: number
  pomosBeforeLong: number
  autoStartBreak: boolean
  autoStartWork: boolean
  soundEnabled: boolean
  language: Language
  timerMode: "standard" | "custom"

}

const DEFAULTS: Settings = {
  workDuration: 25,
  shortBreak: 5,
  longBreak: 15,
  pomosBeforeLong: 4,
  autoStartBreak: false,
  autoStartWork: false,
  soundEnabled: true,
  timerMode: "standard",
  language: "en",
}

interface SettingsStore {
  settings: Settings
  loaded: boolean
  loadSettings: () => Promise<void>
  updateSettings: (partial: Partial<Settings>) => Promise<void>
}

async function getStore() {
  return await load("pocofocus.json")
}

export const useSettings = create<SettingsStore>((set, get) => ({
  settings: DEFAULTS,
  loaded: false,

  loadSettings: async () => {
    const store = await getStore()
    const saved = await store.get<Settings>("settings")
    const settings = { ...DEFAULTS, ...saved }
    set({ settings, loaded: true })

    // Resetea el timer con las duraciones guardadas
  const { useTimer } = await import("./useTimer")
  const { running } = useTimer.getState()
  if (!running) {
    useTimer.getState().reset()
  }
  },

  updateSettings: async (partial) => {
    const next = { ...get().settings, ...partial }
    set({ settings: next })
    const store = await getStore()
    await store.set("settings", next)
  },
}))