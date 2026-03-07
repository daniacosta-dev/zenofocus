import { useEffect } from "react"
import { TrayIcon } from "@tauri-apps/api/tray"
import { useTimer } from "../store/useTimer"

function fmt(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, "0")
  const ss = (s % 60).toString().padStart(2, "0")
  return `${m}:${ss}`
}

export function useTrayTitle() {
  const { timeLeft, running, mode } = useTimer()

  useEffect(() => {
    const update = async () => {
      try {
        const tray = await TrayIcon.getById("tray")
        if (!tray) return
        const label = running ? `⏱ ${fmt(timeLeft)}` : `⏸ PocoFocus`
        await tray.setTooltip(label)
      } catch (_) {}
    }
    update()
  }, [timeLeft, running, mode])
}