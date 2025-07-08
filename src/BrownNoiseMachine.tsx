import React, { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Volume2 } from "lucide-react";
import { motion } from "framer-motion";

/**
 * BrownNoiseMachine – Material 3 Expressive (Modal‑Click Version)
 * Entire card acts as a toggle; background + colours shift when sound is active.
 */
const BrownNoiseMachine = () => {
  // ─── Audio ───────────────────────────────────────────────────────────────────
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);

  // Lazy‑create AudioContext on first interaction
  const getAudioCtx = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtxRef.current;
  };

  const createBrownNoiseBuffer = (ctx: AudioContext) => {
    const length = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }
    return buffer;
  };

  const startNoise = async () => {
    const ctx = getAudioCtx();
    if (ctx.state === "suspended") await ctx.resume();

    const buffer = createBrownNoiseBuffer(ctx);
    gainRef.current = ctx.createGain();
    gainRef.current.gain.value = volume;

    sourceRef.current = ctx.createBufferSource();
    sourceRef.current.buffer = buffer;
    sourceRef.current.loop = true;
    sourceRef.current.connect(gainRef.current).connect(ctx.destination);
    sourceRef.current.start();
    setIsPlaying(true);
  };

  const stopNoise = () => {
    sourceRef.current?.stop();
    sourceRef.current?.disconnect();
    gainRef.current?.disconnect();
    setIsPlaying(false);
  };

  const togglePlayback = () => (isPlaying ? stopNoise() : startNoise());

  const handleVolumeChange = (val: number[]) => {
    const v = val[0];
    setVolume(v);
    if (gainRef.current) gainRef.current.gain.value = v;
  };

  // ─── UI ──────────────────────────────────────────────────────────────────────
  // Colours + gradient adapt to state
  const containerGradient = isPlaying
    ? "bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-500"
    : "bg-gradient-to-br from-amber-50 via-amber-100 to-yellow-50";

  const cardBg = isPlaying ? "bg-white/90" : "bg-white/70";

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center transition-colors duration-700 ${containerGradient}`}
    >
      {/* Clickable expressive card */}
      <motion.div
        initial={{ opacity: 0, translateY: 40 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-4 w-full max-w-lg"
      >
        <Card
          role="button"
          tabIndex={0}
          aria-pressed={isPlaying}
          onClick={togglePlayback}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && togglePlayback()}
          className={`rounded-3xl shadow-amber-200/50 shadow-xl backdrop-blur-sm cursor-pointer outline-none focus-visible:ring-4 focus-visible:ring-amber-400/60 transition-colors duration-700 ${cardBg}`}
        >
          <CardContent className="p-10 flex flex-col gap-10">
            {/* Headline */}
            <h1
              className={`text-3xl font-bold tracking-tight text-center transition-colors duration-700 ${
                isPlaying ? "text-amber-800" : "text-amber-900"
              }`}
            >
              Brown Noise Machine
            </h1>

            {/* State indicator */}
            <p
              className={`text-center text-lg font-medium transition-colors duration-700 ${
                isPlaying ? "text-amber-800" : "text-amber-500"
              }`}
            >
              {isPlaying ? "Playing – tap to pause" : "Paused – tap to play"}
            </p>

            {/* Volume */}
            <div className="flex items-center gap-6">
              <Volume2
                className={`w-5 h-5 transition-colors duration-700 ${
                  isPlaying ? "text-amber-800" : "text-amber-700"
                }`}
                aria-hidden="true"
              />
              <Slider
                value={[volume]}
                onValueChange={handleVolumeChange}
                max={1}
                step={0.01}
                className="flex-1"
              />
              <span
                className={`w-12 text-right tabular-nums text-sm transition-colors duration-700 ${
                  isPlaying ? "text-amber-800" : "text-amber-700"
                }`}
              >
                {(volume * 100).toFixed(0)}%
              </span>
            </div>

            {/* Footer */}
            <p
              className={`text-sm leading-relaxed text-center transition-colors duration-700 ${
                isPlaying ? "text-amber-800" : "text-amber-700"
              }`}
            >
              Calm, warm soundscape for focused relaxation – powered by Material 3 Expressive design.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default BrownNoiseMachine;
