import { useSettings } from "../store/useSettings"
import { i18n } from "../i18n"

export function useT() {
  const language = useSettings((s) => s.settings.language)
  return i18n[language]
}