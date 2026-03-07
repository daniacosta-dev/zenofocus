import { create } from "zustand"
import { load } from "@tauri-apps/plugin-store"

export type Category = "trabajo" | "reunion" | "admin" | "personal"

export interface Task {
  id: string
  text: string
  done: boolean
  pomos: number
  category: Category
  createdAt: string // fecha ISO, para saber si es de hoy
  scheduledAt?: string
}

interface TaskStore {
  tasks: Task[]
  activeTaskId: string | null
  loaded: boolean
  loadTasks: () => Promise<void>
  addTask: (text: string, category?: Category, pomos?: number) => Promise<void>
  toggleTask: (id: string) => Promise<void>
  updateTask: (id: string, text: string) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  setActiveTask: (id: string) => void
  addScheduledTask: (text: string, scheduledAt: string, category?: Category) => Promise<void>
  saveDailySummary: (pomosToday: number) => Promise<void>
  loadWeeklyHistory: () => Promise<DailySummary[]>
}

export interface DailySummary {
  date: string        // "2026-03-05"
  pomosCompleted: number
  tasksCompleted: number
  focusMinutes: number
}

// Helpers
const today = () => new Date().toISOString().split("T")[0]
const uid = () => crypto.randomUUID()

async function getStore() {
  return await load("pocofocus.json")
}

export const useTasks = create<TaskStore>((set, get) => ({
  tasks: [],
  activeTaskId: null,
  loaded: false,

  saveDailySummary: async (pomosToday: number) => {
  const { tasks } = get()
  const date = new Date().toISOString().split("T")[0]

  const summary: DailySummary = {
    date,
    pomosCompleted: pomosToday,
    tasksCompleted: tasks.filter(t => t.done).length,
    focusMinutes: pomosToday * 25,
  }

  const store = await getStore()
  const history = await store.get<DailySummary[]>("history") ?? []
  const existing = history.findIndex(h => h.date === date)

  if (existing >= 0) {
    history[existing] = summary
  } else {
    history.push(summary)
  }

  const last30 = history.slice(-30)
  await store.set("history", last30)
},

loadWeeklyHistory: async () => {
  const store = await getStore()
  const history = await store.get<DailySummary[]>("history") ?? []
  return history.slice(-7)
},


  addScheduledTask: async (text, scheduledAt, category = "trabajo") => {
    const task: Task = {
      id: uid(),
      text,
      done: false,
      pomos: 1,
      category,
      createdAt: new Date().toISOString(),
      scheduledAt,
    }
    const next = [...get().tasks, task]
    set({ tasks: next })
    const store = await getStore()
    await store.set("tasks", next)
  },
  
  updateTask: async (id, text) => {
  if (!text.trim()) return
  const next = get().tasks.map((t) =>
    t.id === id ? { ...t, text: text.trim() } : t
  )
  set({ tasks: next })
  const store = await getStore()
  await store.set("tasks", next)
},

  loadTasks: async () => {
    const store = await getStore()
    const raw = await store.get<Task[]>("tasks")
    // Solo cargamos tareas de hoy
    const todayTasks = (raw ?? []).filter(
      (t) => t.createdAt?.startsWith(today())
    )
    set({ tasks: todayTasks, loaded: true })
  },

  addTask: async (text, category = "trabajo", pomos = 1) => {
    const task: Task = {
      id: uid(),
      text,
      done: false,
      pomos,
      category,
      createdAt: new Date().toISOString(),
    }
    const next = [...get().tasks, task]
    set({ tasks: next })
    const store = await getStore()
    await store.set("tasks", next)
  },

  toggleTask: async (id) => {
  const { tasks, activeTaskId } = get()
  const next = tasks.map((t) =>
    t.id === id ? { ...t, done: !t.done } : t
  )
  
  const taskJustCompleted = next.find(t => t.id === id)?.done
  const isActiveTask = activeTaskId === id

  set({
    tasks: next,
    activeTaskId: isActiveTask && taskJustCompleted ? null : activeTaskId,
  })

  const store = await getStore()
  await store.set("tasks", next)
},

  deleteTask: async (id) => {
    const next = get().tasks.filter((t) => t.id !== id)
    set({ tasks: next })
    const store = await getStore()
    await store.set("tasks", next)
  },

  setActiveTask: (id) => set({ activeTaskId: id }),
}))