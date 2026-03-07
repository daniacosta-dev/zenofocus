export function playFinishSound() {
  try {
    const ctx = new AudioContext()

    const playBeep = (freq: number, start: number, duration: number, gain: number) => {
      const osc = ctx.createOscillator()
      const gainNode = ctx.createGain()

      osc.connect(gainNode)
      gainNode.connect(ctx.destination)

      osc.frequency.value = freq
      osc.type = "sine"

      gainNode.gain.setValueAtTime(0, ctx.currentTime + start)
      gainNode.gain.linearRampToValueAtTime(gain, ctx.currentTime + start + 0.01)
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + start + duration)

      osc.start(ctx.currentTime + start)
      osc.stop(ctx.currentTime + start + duration + 0.1)
    }

    // Melodía de 3 notas
    playBeep(523, 0.0, 0.15, 0.3)   // C5
    playBeep(659, 0.2, 0.15, 0.3)   // E5
    playBeep(784, 0.4, 0.3,  0.3)   // G5

    setTimeout(() => ctx.close(), 2000)
  } catch (_) {}
}