// Halloween-styled SVG pieces used in the board and UI.
import type { CSSProperties } from "react";

type PieceProps = { className?: string; style?: CSSProperties };

// Player: severed skull (jaw missing), with fresh blood dripping
export function SkullHead({ className, style }: PieceProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} aria-hidden>
      <defs>
        <radialGradient id="skullG" cx="40%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#f1ead6" />
          <stop offset="55%" stopColor="#cdbf9a" />
          <stop offset="100%" stopColor="#7a6c52" />
        </radialGradient>
        <linearGradient id="bloodG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b8000a" />
          <stop offset="100%" stopColor="#5e0006" />
        </linearGradient>
        <radialGradient id="eyeG" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#ff2a18" />
          <stop offset="60%" stopColor="#7a0a06" />
          <stop offset="100%" stopColor="#1a0000" />
        </radialGradient>
      </defs>

      {/* Blood splatter behind skull */}
      <ellipse cx="50" cy="78" rx="38" ry="10" fill="#5e0006" opacity="0.45" />
      <circle cx="20" cy="60" r="4" fill="#8a0008" opacity="0.6" />
      <circle cx="84" cy="64" r="3" fill="#8a0008" opacity="0.55" />

      {/* Cranium */}
      <path
        d="M22 44 Q22 18 50 16 Q78 18 78 44 Q78 58 70 62 L70 72 Q70 78 62 78 L58 78 L58 84 L54 78 L50 84 L46 78 L42 84 L38 78 Q30 78 30 72 L30 62 Q22 58 22 44 Z"
        fill="url(#skullG)"
        stroke="#3a3024"
        strokeWidth="1.5"
      />
      {/* Jagged break where the jaw was severed */}
      <path
        d="M30 72 L34 78 L38 73 L42 80 L46 72 L50 80 L54 72 L58 80 L62 73 L66 78 L70 72"
        stroke="#3a3024"
        strokeWidth="1.2"
        fill="none"
      />
      {/* Crack */}
      <path d="M60 22 L58 32 L64 38 L60 46" stroke="#3a3024" strokeWidth="1" fill="none" opacity="0.7" />

      {/* Eye sockets (hollow, glowing red) */}
      <ellipse cx="38" cy="44" rx="9" ry="11" fill="url(#eyeG)" />
      <ellipse cx="62" cy="44" rx="9" ry="11" fill="url(#eyeG)" />
      <circle cx="40" cy="46" r="2.2" fill="#ffd24a" opacity="0.9" />
      <circle cx="64" cy="46" r="2.2" fill="#ffd24a" opacity="0.9" />

      {/* Nose hole (inverted triangle) */}
      <path d="M50 52 L44 64 L56 64 Z" fill="#1a0a00" />
      <path d="M48 60 L52 60 L50 66 Z" fill="#3a0a06" opacity="0.7" />

      {/* Teeth row (upper, remaining) */}
      <g fill="#e6dcc0" stroke="#3a3024" strokeWidth="0.6">
        <rect x="34" y="66" width="6" height="6" />
        <rect x="41" y="66" width="6" height="6" />
        <rect x="48" y="66" width="6" height="6" />
        <rect x="55" y="66" width="6" height="6" />
        <rect x="62" y="66" width="4" height="6" />
      </g>

      {/* Blood drips from sockets and break */}
      <path d="M36 50 Q33 62 36 72 L38 72 Q36 62 38 50 Z" fill="url(#bloodG)" />
      <path d="M64 50 Q67 60 64 70 L62 70 Q64 60 62 50 Z" fill="url(#bloodG)" />
      <path d="M48 78 L48 92 Q50 96 52 92 L52 78 Z" fill="url(#bloodG)" />
      <path d="M44 78 L43 88 L46 88 L45 78 Z" fill="url(#bloodG)" opacity="0.8" />
      {/* Drip beads */}
      <circle cx="37" cy="74" r="2.4" fill="#b8000a" />
      <circle cx="63" cy="72" r="2.2" fill="#b8000a" />
      <circle cx="50" cy="94" r="2.6" fill="#b8000a" />
    </svg>
  );
}

// Computer: older, greyer skull with a darker, more rotten look and black hollow sockets
export function RottenSkullHead({ className, style }: PieceProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} aria-hidden>
      <defs>
        <radialGradient id="rskullG" cx="40%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#b8b4a6" />
          <stop offset="55%" stopColor="#7a766a" />
          <stop offset="100%" stopColor="#3a382f" />
        </radialGradient>
        <linearGradient id="rbloodG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a0a06" />
          <stop offset="100%" stopColor="#1a0000" />
        </linearGradient>
        <radialGradient id="reyeG" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#7CFBD8" />
          <stop offset="55%" stopColor="#0e3a2e" />
          <stop offset="100%" stopColor="#000" />
        </radialGradient>
      </defs>

      <ellipse cx="50" cy="78" rx="38" ry="9" fill="#1a0000" opacity="0.5" />

      {/* Cranium — slightly more angular / rotten */}
      <path
        d="M22 46 Q22 18 50 16 Q78 18 78 46 Q78 60 70 64 L70 74 Q70 80 62 80 L58 80 L58 86 L54 80 L50 86 L46 80 L42 86 L38 80 Q30 80 30 74 L30 64 Q22 60 22 46 Z"
        fill="url(#rskullG)"
        stroke="#1f1d16"
        strokeWidth="1.5"
      />
      {/* Missing chunks */}
      <path d="M70 30 Q74 30 74 36 L70 38 Z" fill="#0a0a06" />
      <path d="M26 38 Q22 40 24 46 L28 44 Z" fill="#0a0a06" />
      {/* Jagged severed jaw break */}
      <path
        d="M30 74 L34 80 L38 74 L42 82 L46 74 L50 82 L54 74 L58 82 L62 74 L66 80 L70 74"
        stroke="#1f1d16"
        strokeWidth="1.2"
        fill="none"
      />

      {/* Eye sockets — hollow black with ghostly green glint */}
      <ellipse cx="38" cy="46" rx="9" ry="11" fill="#000" />
      <ellipse cx="62" cy="46" rx="9" ry="11" fill="#000" />
      <circle cx="40" cy="48" r="2.4" fill="#7CFBD8" opacity="0.85" />
      <circle cx="64" cy="48" r="2.4" fill="#7CFBD8" opacity="0.85" />

      {/* Nose hole */}
      <path d="M50 54 L44 66 L56 66 Z" fill="#000" />

      {/* Fewer teeth (rotten) */}
      <g fill="#5a564a" stroke="#1f1d16" strokeWidth="0.6">
        <rect x="36" y="68" width="6" height="6" />
        <rect x="50" y="68" width="6" height="6" />
        <rect x="60" y="68" width="5" height="6" />
      </g>

      {/* Dried, dark blood */}
      <path d="M36 52 Q33 64 36 74 L38 74 Q36 64 38 52 Z" fill="url(#rbloodG)" />
      <path d="M64 52 Q67 62 64 72 L62 72 Q64 62 62 52 Z" fill="url(#rbloodG)" />
      <path d="M50 82 L50 94 Q52 98 54 94 L54 82 Z" fill="url(#rbloodG)" />
      <circle cx="37" cy="76" r="2.2" fill="#3a0a06" />
      <circle cx="63" cy="74" r="2.0" fill="#3a0a06" />
      <circle cx="52" cy="96" r="2.2" fill="#3a0a06" />
    </svg>
  );
}

// Decorative small bat (flaps)
export function Bat({ className, style }: PieceProps) {
  return (
    <svg viewBox="0 0 100 50" className={className} style={style} aria-hidden>
      <g className="bat-wing">
        <path
          d="M50 25 Q40 5 20 12 Q30 18 22 22 Q34 20 28 30 Q40 24 50 28 Z"
          fill="#0a0612"
          stroke="#241836"
          strokeWidth="1"
        />
        <path
          d="M50 25 Q60 5 80 12 Q70 18 78 22 Q66 20 72 30 Q60 24 50 28 Z"
          fill="#0a0612"
          stroke="#241836"
          strokeWidth="1"
        />
      </g>
      <ellipse cx="50" cy="26" rx="6" ry="7" fill="#0a0612" />
      <path d="M47 20 L46 14 M53 20 L54 14" stroke="#0a0612" strokeWidth="2" />
    </svg>
  );
}

// Spiderweb SVG, drawn in a corner. `flip` mirrors it for other corners.
export function Spiderweb({
  className,
  style,
  flip,
}: PieceProps & { flip?: "x" | "y" | "xy" }) {
  const sx = flip?.includes("x") ? -1 : 1;
  const sy = flip?.includes("y") ? -1 : 1;
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      style={style}
      aria-hidden
      preserveAspectRatio="xMaxYMin meet"
    >
      <g transform={`scale(${sx} ${sy})`} stroke="rgba(220,220,235,0.55)" fill="none" strokeWidth="0.7">
        {/* radial threads from the corner (0,0) */}
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * (Math.PI / 2);
          return <line key={i} x1="0" y1="0" x2={Math.cos(a) * 100} y2={Math.sin(a) * 100} />;
        })}
        {/* concentric arcs */}
        {[18, 36, 56, 78, 100].map((r, i) => {
          const pts: string[] = [];
          for (let k = 0; k <= 8; k++) {
            const a = (k / 8) * (Math.PI / 2);
            pts.push(`${Math.cos(a) * r},${Math.sin(a) * r}`);
          }
          return <polyline key={i} points={pts.join(" ")} opacity={1 - i * 0.12} />;
        })}
      </g>
      {/* Little spider dangling */}
      <g transform={`scale(${sx} ${sy}) translate(46 30)`} className="floaty-slow">
        <line x1="0" y1="-30" x2="0" y2="0" stroke="rgba(220,220,235,0.5)" strokeWidth="0.6" />
        <ellipse cx="0" cy="2" rx="3" ry="2.4" fill="#0a0612" />
        <circle cx="0" cy="-1" r="1.6" fill="#0a0612" />
        <path d="M0 1 L-6 6 M0 1 L6 6 M0 2 L-7 9 M0 2 L7 9" stroke="#0a0612" strokeWidth="0.6" />
      </g>
    </svg>
  );
}

// (Badges are just the head pieces; import SkullHead/RottenSkullHead directly.)

// The Grim Reaper — a hooded skeleton with a scythe. Used for the periodic
// "mow the bottom row" event. Drawn large and sweeping.
export function GrimReaper({ className, style }: PieceProps) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}grim-reaper-reference.webp`}
      className={`reaper-figure ${className ?? ""}`}
      style={style}
      alt=""
      aria-hidden="true"
    />
  );
}
