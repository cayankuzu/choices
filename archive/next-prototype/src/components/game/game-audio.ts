type SoundName = "choice" | "coffee" | "door" | "eat" | "engine" | "gun" | "reload";

let audioContext: AudioContext | null = null;

function getAudioContext() {
  audioContext ??= new AudioContext();
  return audioContext;
}

function tone(context: AudioContext, frequency: number, start: number, duration: number, gainValue: number) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.frequency.setValueAtTime(frequency, start);
  oscillator.type = "triangle";
  gain.gain.setValueAtTime(gainValue, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration);
}

export function playGameSound(name: SoundName, volume = 0.45) {
  if (volume <= 0 || typeof window === "undefined") return;

  try {
    const context = getAudioContext();
    const now = context.currentTime;
    const level = Math.max(0.001, Math.min(1, volume));

    if (name === "gun") {
      const buffer = context.createBuffer(1, Math.floor(context.sampleRate * 0.13), context.sampleRate);
      const channel = buffer.getChannelData(0);
      for (let index = 0; index < channel.length; index += 1) {
        channel[index] = (Math.random() * 2 - 1) * (1 - index / channel.length);
      }
      const source = context.createBufferSource();
      const gain = context.createGain();
      gain.gain.setValueAtTime(level * 0.42, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);
      source.buffer = buffer;
      source.connect(gain).connect(context.destination);
      source.start(now);
      tone(context, 92, now, 0.12, level * 0.2);
      return;
    }

    if (name === "door") {
      tone(context, 128, now, 0.09, level * 0.24);
      tone(context, 112, now + 0.16, 0.11, level * 0.22);
      return;
    }

    if (name === "reload") {
      tone(context, 390, now, 0.06, level * 0.1);
      tone(context, 240, now + 0.1, 0.08, level * 0.12);
      return;
    }

    const frequencies: Record<Exclude<SoundName, "door" | "gun" | "reload">, number> = {
      choice: 210,
      coffee: 330,
      eat: 460,
      engine: 82,
    };
    tone(context, frequencies[name], now, name === "engine" ? 0.42 : 0.16, level * 0.11);
  } catch {
    // Ses desteği olmayan ortamlarda oyun sessiz çalışmaya devam eder.
  }
}
