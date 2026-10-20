// Ambient Halloween scene: moon, drifting bats, fog, silhouetted graveyard.
import { useMemo } from "react";
import { Bat } from "./Pieces";
import { useLang } from "@/lib/i18n";

type BatSpec = { top: string; duration: string; delay: string; scale: number };

export function SpookyScene() {
  const bats = useMemo<BatSpec[]>(
    () =>
      Array.from({ length: 7 }).map((_, i) => ({
        top: `${8 + ((i * 13) % 40)}%`,
        duration: `${14 + (i % 5) * 4}s`,
        delay: `${(i % 4) * 2.5}s`,
        scale: 0.6 + ((i * 7) % 5) * 0.18,
      })),
    [],
  );

  const stars = useMemo(
    () =>
      Array.from({ length: 60 }).map(() => ({
        top: `${Math.random() * 60}%`,
        left: `${Math.random() * 100}%`,
        size: Math.random() * 2 + 0.6,
        opacity: Math.random() * 0.6 + 0.2,
        twinkle: `${2 + Math.random() * 4}s`,
      })),
    [],
  );

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden sky-bg">
      {/* Stars */}
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-amber-50"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
            animation: `flicker ${s.twinkle} ease-in-out infinite`,
          }}
        />
      ))}

      {/* Moon */}
      <div
        className="moon absolute rounded-full"
        style={{ width: 130, height: 130, top: 60, right: 80 }}
      />

      {/* Drifting bats */}
      {bats.map((b, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: b.top,
            left: 0,
            transform: `scale(${b.scale})`,
            animation: `drift ${b.duration} linear ${b.delay} infinite`,
          }}
        >
          <Bat style={{ width: 60 }} />
        </div>
      ))}

      {/* Witch silhouette on broomstick drifting across the sky */}
      <div
        className="absolute"
        style={{ top: "22%", animation: "drift 26s linear 8s infinite" }}
      >
        <WitchSilhouette />
      </div>

      {/* Graveyard silhouette at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-40">
        <Graveyard />
      </div>

      {/* Fog */}
      <div className="fog absolute bottom-0 left-0 right-0 h-56" />
    </div>
  );
}

function WitchSilhouette() {
  return (
    <svg width="120" height="60" viewBox="0 0 120 60" aria-hidden>
      {/* Broomstick */}
      <line x1="10" y1="38" x2="110" y2="22" stroke="#1a0f2a" strokeWidth="3" />
      <path d="M105 20 L118 14 L118 28 L108 26 Z" fill="#3a2410" />
      {/* Witch body */}
      <path d="M40 40 Q44 18 56 18 Q66 18 62 40 Z" fill="#0a0612" />
      <path d="M52 18 L48 4 L56 16 L60 2 L60 18 Z" fill="#0a0612" />
      {/* Hat brim */}
      <ellipse cx="56" cy="16" rx="14" ry="3" fill="#0a0612" />
      {/* Cape trail */}
      <path d="M40 40 Q30 48 22 44 Q34 46 40 44 Z" fill="#0a0612" />
    </svg>
  );
}

function Graveyard() {
  const { t } = useLang();
  const stones = [
    { left: "4%", w: 46, h: 64, tilt: -6, label: "R.I.P" },
    { left: "16%", w: 38, h: 52, tilt: 4, label: "???" },
    { left: "26%", w: 54, h: 72, tilt: -2, label: "BOO" },
    { left: "40%", w: 42, h: 58, tilt: 8, label: "1666" },
    { left: "52%", w: 48, h: 68, tilt: -5, label: t.graveHere },
    { left: "66%", w: 36, h: 50, tilt: 3, label: "X" },
    { left: "76%", w: 52, h: 70, tilt: -7, label: "R.I.P" },
    { left: "88%", w: 40, h: 56, tilt: 5, label: t.graveDead },
  ];
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 1200 160"
      preserveAspectRatio="none"
      aria-hidden
    >
      {/* Ground */}
      <path d="M0 120 Q300 100 600 110 T1200 108 L1200 160 L0 160 Z" fill="#08040f" />
      {/* Dead trees */}
      <Tree x={120} />
      <Tree x={1080} />
      {/* Gravestones */}
      {stones.map((s, i) => (
        <g
          key={i}
          transform={`translate(${parseFloat(s.left) * 12} ${130 - s.h}) rotate(${s.tilt} ${s.w / 2} ${s.h})`}
        >
          <path
            d={`M0 ${s.h} L0 ${s.h * 0.4} Q0 0 ${s.w / 2} 0 Q${s.w} 0 ${s.w} ${s.h * 0.4} L${s.w} ${s.h} Z`}
            fill="#1c1530"
            stroke="#0a0612"
            strokeWidth="2"
          />
          <text
            x={s.w / 2}
            y={s.h * 0.45}
            textAnchor="middle"
            fontSize="10"
            fill="#3a2c5a"
            fontFamily="serif"
          >
            {s.label}
          </text>
        </g>
      ))}
      {/* Crooked fence */}
      <Fence />
    </svg>
  );
}

function Tree({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} 0)`} fill="#05030a" stroke="#05030a">
      <rect x="-3" y="40" width="6" height="90" />
      <path d="M0 70 L-26 50 M0 80 L24 56 M-18 54 L-32 38 M16 58 L30 44 M0 60 L-10 40 M0 64 L12 44" stroke="#05030a" strokeWidth="3" fill="none" />
    </g>
  );
}

function Fence() {
  return (
    <g fill="#0a0612" stroke="#0a0612">
      {Array.from({ length: 24 }).map((_, i) => (
        <rect
          key={i}
          x={i * 52 + (i % 2 === 0 ? 0 : 6)}
          y={90}
          width={5}
          height={40}
          transform={`rotate(${i % 2 === 0 ? -3 : 3} ${i * 52 + 2} 130)`}
        />
      ))}
    </g>
  );
}
