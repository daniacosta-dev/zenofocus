import { useSettings } from "../../store/useSettings"
import type { Language } from "../../store/useSettings"
import HowItWorks from "../../components/Settings/HowItWors"
import { useT } from "../../hooks/useTranslation"
import { useTimer } from "../../store/useTimer"

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: 40, height: 22, borderRadius: 11, cursor: "pointer",
        background: value ? "#f59e0b" : "#1e1e2e",
        position: "relative", transition: "background 0.2s",
        border: `1px solid ${value ? "#f59e0b" : "#3f3f46"}`,
        flexShrink: 0,
      }}
    >
      <div style={{
        position: "absolute",
        top: 2, left: value ? 20 : 2,
        width: 16, height: 16, borderRadius: "50%",
        background: value ? "#000" : "#52525b",
        transition: "left 0.2s",
      }} />
    </div>
  )
}

function NumberInput({ value, onChange, min, max }: {
  value: number
  onChange: (v: number) => void
  min: number
  max: number
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        style={{
          width: 28, height: 28, borderRadius: 6,
          background: "#12121e", border: "1px solid #1e1e2e",
          color: "#a1a1aa", cursor: "pointer", fontSize: 16,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >−</button>
      <span style={{
        width: 36, textAlign: "center",
        fontSize: 14, fontWeight: 700, color: "#f4f4f5",
      }}>
        {value}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        style={{
          width: 28, height: 28, borderRadius: 6,
          background: "#12121e", border: "1px solid #1e1e2e",
          color: "#a1a1aa", cursor: "pointer", fontSize: 16,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >+</button>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "#0a0a14", border: "1px solid #12121e",
      borderRadius: 10, padding: "16px 20px", marginBottom: 16,
    }}>
      <div style={{
        fontSize: 11, color: "#52525b", letterSpacing: "0.1em",
        textTransform: "uppercase", marginBottom: 16,
      }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function Row({ label, description, children }: {
  label: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div style={{
      display: "flex", alignItems: "center",
      justifyContent: "space-between", gap: 16,
      paddingBottom: 14, marginBottom: 14,
      borderBottom: "1px solid #12121e",
    }}>
      <div>
        <div style={{ fontSize: 13, color: "#e4e4f0" }}>{label}</div>
        {description && (
          <div style={{ fontSize: 11, color: "#52525b", marginTop: 2 }}>{description}</div>
        )}
      </div>
      {children}
    </div>
  )
}

export default function Settings() {
  const { settings, updateSettings } = useSettings()
  const { reset } = useTimer()
  const txt = useT()

  const update = async (partial: Parameters<typeof updateSettings>[0]) => {
    await updateSettings(partial)
    reset() // resetea el timer con las nuevas duraciones
  }

  const handleTimerModeChange = (mode: "standard" | "custom") => {
    if (mode === "standard") {
      updateSettings({
        timerMode: "standard",
        workDuration: 25,
        shortBreak: 5,
        longBreak: 15,
      })
    } else {
      updateSettings({ timerMode: "custom" })
    }
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 24, letterSpacing: "-0.02em" }}>
          {txt.title}
        </div>
        <HowItWorks />
        {/* Timer */}
        <Section title={txt.timer}>
          {/* Toggle Standard / Custom */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: "#52525b", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {txt.timerMode}
            </div>
            <div style={{
              display: "flex", background: "#0a0a14",
              border: "1px solid #1e1e2e", borderRadius: 8, padding: 3, gap: 3,
            }}>
              {(["standard", "custom"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => handleTimerModeChange(mode)}
                  style={{
                    flex: 1, padding: "7px 0", borderRadius: 6, border: "none",
                    cursor: "pointer", fontSize: 12, fontWeight: 600,
                    transition: "all 0.15s",
                    background: settings.timerMode === mode ? "#f59e0b" : "transparent",
                    color: settings.timerMode === mode ? "#000" : "#52525b",
                  }}
                >
                  {mode === "standard" ? txt.standard : txt.custom}
                </button>
              ))}
            </div>
            {settings.timerMode === "standard" && (
              <div style={{
                marginTop: 8, fontSize: 11, color: "#52525b",
                padding: "6px 10px", background: "#0a0a14",
                border: "1px solid #1e1e2e", borderRadius: 6,
              }}>
                ⏱ {txt.standardDesc}
              </div>
            )}
          </div>

          {/* Duraciones — deshabilitadas en standard */}
          <div style={{ opacity: settings.timerMode === "standard" ? 0.4 : 1, pointerEvents: settings.timerMode === "standard" ? "none" : "auto" }}>
            <Row label={txt.workDuration} description={txt.workDesc}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <NumberInput
                  value={settings.workDuration}
                  onChange={(v) => update({ workDuration: v })}
                  min={1} max={90}
                />
                <span style={{ fontSize: 11, color: "#52525b" }}>min</span>
              </div>
            </Row>
            <Row label={txt.shortBreak} description={txt.shortDesc}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <NumberInput
                  value={settings.shortBreak}
                  onChange={(v) => update({ shortBreak: v })}
                  min={1} max={30}
                />
                <span style={{ fontSize: 11, color: "#52525b" }}>min</span>
              </div>
            </Row>
            <Row label={txt.longBreak} description={txt.longDesc}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <NumberInput
                  value={settings.longBreak}
                  onChange={(v) => update({ longBreak: v })}
                  min={1} max={60}
                />
                <span style={{ fontSize: 11, color: "#52525b" }}>min</span>
              </div>
            </Row>
            <Row label={txt.pomosBeforeLong} description={txt.pomosDesc}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <NumberInput
              value={settings.pomosBeforeLong}
              onChange={(v) => update({ pomosBeforeLong: v })}
              min={1} max={10}
            />
            <span style={{ fontSize: 11, color: "#52525b" }}>pom</span>
            </div>
          </Row>
          </div>
        </Section>

        {/* Automatización */}
        <Section title={txt.automation}>
          <Row label={txt.autoStartBreak} description={txt.autoStartBreakDesc}>
            <Toggle
              value={settings.autoStartBreak}
              onChange={(v) => updateSettings({ autoStartBreak: v })}
            />
          </Row>
          <Row label={txt.autoStartWork} description={txt.autoStartWorkDesc}>
            <Toggle
              value={settings.autoStartWork}
              onChange={(v) => updateSettings({ autoStartWork: v })}
            />
          </Row>
        </Section>

        {/* Sonido */}
        <Section title={txt.sound}>
          <Row label={txt.soundEnabled} description={txt.soundDesc}>
            <Toggle
              value={settings.soundEnabled}
              onChange={(v) => updateSettings({ soundEnabled: v })}
            />
          </Row>
        </Section>

        {/* Idioma */}
        <Section title={txt.language}>
          <Row label={txt.language} description={txt.langDesc}>
            <div style={{ display: "flex", gap: 6 }}>
              {(["es", "en"] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => updateSettings({ language: lang })}
                  style={{
                    background: settings.language === lang ? "#f59e0b22" : "transparent",
                    border: `1px solid ${settings.language === lang ? "#f59e0b" : "#1e1e2e"}`,
                    color: settings.language === lang ? "#f59e0b" : "#52525b",
                    padding: "5px 14px", borderRadius: 6,
                    fontSize: 12, cursor: "pointer",
                  }}
                >
                  {lang === "es" ? "🇪🇸 Español" : "🇬🇧 English"}
                </button>
              ))}
            </div>
          </Row>
        </Section>

        <div style={{ fontSize: 11, color: "#3f3f46", textAlign: "center", marginTop: 8 }}>
          {txt.save}
        </div>
      </div>
    </div>
  )
}