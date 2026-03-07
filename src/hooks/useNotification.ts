import { invoke } from "@tauri-apps/api/core"

export async function notify(title: string, body: string) {
  console.log("notify llamado:", title, body)
  try {
    await invoke("send_notification", { title, body })
  } catch (e) {
    console.error("notify error:", e)
  }
}