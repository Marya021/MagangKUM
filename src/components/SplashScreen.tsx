import { useEffect, useRef, useState } from "react";
import logoKemenkum from "@/assets/logo-kemenkum.png";

function playClingSound() {
  try {
    const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Soft magical shimmer: arpeggio of bell-like tones (C6 - E6 - G6 - C7)
    const notes = [
      { freq: 1046.5, delay: 0.0 },  // C6
      { freq: 1318.5, delay: 0.08 }, // E6
      { freq: 1568.0, delay: 0.16 }, // G6
      { freq: 2093.0, delay: 0.24 }, // C7
    ];

    const master = ctx.createGain();
    master.gain.value = 0.35;
    master.connect(ctx.destination);

    notes.forEach(({ freq, delay }) => {
      const t = now + delay;
      // Bell tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.9, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.6);
      osc.connect(gain);
      gain.connect(master);
      osc.start(t);
      osc.stop(t + 1.7);

      // Sparkle harmonic (one octave up, softer)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(freq * 2, t);
      gain2.gain.setValueAtTime(0, t);
      gain2.gain.linearRampToValueAtTime(0.25, t + 0.02);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
      osc2.connect(gain2);
      gain2.connect(master);
      osc2.start(t);
      osc2.stop(t + 0.9);
    });
  } catch {
    // audio not supported, silently skip
  }
}


/**
 * Splash screen with the MagangKUM logo and wordmark.
 * Shows once on every full page load (refresh / first open), then fades out.
 * Plays a magical "cling" bell sound on appearance.
 */
export function SplashScreen() {
  const [mounted, setMounted] = useState(true);
  const hasPlayed = useRef(false);

  useEffect(() => {
    const tryPlay = () => {
      if (hasPlayed.current) return;
      hasPlayed.current = true;
      playClingSound();
      window.removeEventListener("pointerdown", tryPlay);
      window.removeEventListener("keydown", tryPlay);
      window.removeEventListener("touchstart", tryPlay);
    };

    // Try immediately (works if browser allows autoplay / prior user gesture)
    const soundTimer = setTimeout(() => {
      if (!hasPlayed.current) {
        try {
          const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
          if (AudioCtx) {
            const probe = new AudioCtx();
            if (probe.state === "running") {
              tryPlay();
            } else {
              probe.close?.();
            }
          }
        } catch {
          // ignore
        }
      }
    }, 300);

    // Fallback: play on first user interaction
    window.addEventListener("pointerdown", tryPlay, { once: true });
    window.addEventListener("keydown", tryPlay, { once: true });
    window.addEventListener("touchstart", tryPlay, { once: true });

    const t = setTimeout(() => setMounted(false), 7000);
    return () => {
      clearTimeout(t);
      clearTimeout(soundTimer);
      window.removeEventListener("pointerdown", tryPlay);
      window.removeEventListener("keydown", tryPlay);
      window.removeEventListener("touchstart", tryPlay);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      className="splash-overlay fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-[hsl(200_70%_96%)] via-background to-[hsl(200_70%_92%)]"
      aria-hidden="true"
    >
      {/* Sparkle particles */}
      <div className="pointer-events-none absolute inset-1 overflow-hidden">
        <span className="splash-sparkle absolute left-[20%] top-[30%] h-1.5 w-1.5 rounded-full bg-primary/60" />
        <span className="splash-sparkle absolute left-[75%] top-[25%] h-1 w-1 rounded-full bg-primary/40" />
        <span className="splash-sparkle absolute left-[65%] top-[60%] h-2 w-2 rounded-full bg-primary/50" />
        <span className="splash-sparkle absolute left-[30%] top-[65%] h-1 w-1 rounded-full bg-primary/30" />
        <span className="splash-sparkle absolute left-[80%] top-[70%] h-1.5 w-1.5 rounded-full bg-primary/50" />
      </div>

      {/* Logo */}
      <div className="splash-logo relative z-20">
        <div className="absolute inset-0 -z-10 rounded-full bg-primary/20 blur-2xl" />
        <img
          src={logoKemenkum}
          alt="MagangKUM"
          className="h-24 w-24 object-contain drop-shadow-[0_10px_24px_rgba(15,42,90,0.25)] sm:h-28 sm:w-28"
        />
      </div>

      {/* Wordmark */}
      <div className="splash-text relative z-20 mt-6 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Magang<span className="text-primary">KUM</span>
        </h1>
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Kementerian Hukum Riau
        </p>
      </div>
    </div>
  );
}
