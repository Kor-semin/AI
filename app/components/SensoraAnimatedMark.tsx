"use client";

import { useId } from "react";

/** Same spine as Quiet Nebula S PWA artwork (scaled in 512×512 viewBox). */
const NEBULA_PATH =
  "M 306 162 C 184 162 126 230 126 292 C 126 348 204 380 268 390 C 328 400 386 438 386 492 C 386 536 328 554 242 542 C 192 532 162 484 162 434";

export type SensoraAnimatedMarkProps = {
  /** Square edge length in px. */
  size?: number;
  className?: string;
  animated?: boolean;
  /** Passed to wrapping span when present (decorative-only if omitted → aria-hidden). */
  label?: string;
};

/**
 * In-app Quiet Nebula S mark — subtle aura / drift / star shimmer when `animated`.
 * Uses CSS only for motion (`prefers-reduced-motion` in globals.css). Static PWA icons unchanged.
 */
export function SensoraAnimatedMark({
  size = 88,
  className = "",
  animated = true,
  label,
}: SensoraAnimatedMarkProps) {
  const rid = useId().replace(/:/g, "");

  const idBg = `${rid}-bg`;
  const idWash = `${rid}-wash`;
  const idWash2 = `${rid}-wash2`;
  const idVig = `${rid}-vig`;
  const idRim = `${rid}-rim`;
  const idTipT = `${rid}-tipT`;
  const idTipB = `${rid}-tipB`;

  const motionAura = animated ? "sensora-mark-aura-layer" : "";
  const motionDrift = animated ? "sensora-mark-drift-layer" : "";
  const motionStarA = animated ? "sensora-mark-star sensora-mark-star--a" : "sensora-mark-star";
  const motionStarB = animated ? "sensora-mark-star sensora-mark-star--b" : "sensora-mark-star";
  const motionStarC = animated ? "sensora-mark-star sensora-mark-star--c" : "sensora-mark-star";

  return (
    <span
      className={`sensora-animated-mark pointer-events-none inline-block select-none ${className}`.trim()}
      style={{ width: size, height: size }}
      role={label ? "img" : undefined}
      aria-label={label ?? undefined}
      aria-hidden={label ? undefined : true}
    >
      <svg className="block size-full overflow-visible" viewBox="0 0 512 512" aria-hidden focusable="false">
        <defs>
          <radialGradient id={idBg} cx="42%" cy="34%" r="92%">
            <stop offset="0%" stopColor="#152542" />
            <stop offset="38%" stopColor="#0e1628" />
            <stop offset="72%" stopColor="#060a14" />
            <stop offset="100%" stopColor="#02040a" />
          </radialGradient>
          <radialGradient id={idWash} cx="28%" cy="22%" r="65%">
            <stop offset="0%" stopColor="#2a3868" stopOpacity="0.24" />
            <stop offset="55%" stopColor="#283060" stopOpacity="0.09" />
            <stop offset="100%" stopColor="#1a2548" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={idWash2} cx="82%" cy="78%" r="58%">
            <stop offset="0%" stopColor="#3a3568" stopOpacity="0.2" />
            <stop offset="60%" stopColor="#2c2850" stopOpacity="0.07" />
            <stop offset="100%" stopColor="#181428" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={idVig} cx="50%" cy="46%" r="72%">
            <stop offset="55%" stopColor="#020306" stopOpacity="0" />
            <stop offset="100%" stopColor="#010208" stopOpacity="0.45" />
          </radialGradient>
          <linearGradient id={idRim} x1="8%" y1="4%" x2="94%" y2="96%">
            <stop offset="0%" stopColor="#1e2e48" />
            <stop offset="100%" stopColor="#080c18" />
          </linearGradient>
          <radialGradient id={idTipT} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8c98cc" stopOpacity="0.5" />
            <stop offset="45%" stopColor="#5c6494" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#3a4070" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={idTipB} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8090bc" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#506088" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#303858" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="512" height="512" rx="108" fill="#02040c" />
        <rect width="512" height="512" rx="108" fill={`url(#${idBg})`} />
        <rect width="512" height="512" rx="108" fill={`url(#${idWash})`} />
        <rect width="512" height="512" rx="108" fill={`url(#${idWash2})`} />
        <ellipse cx="120" cy="380" rx="240" ry="150" fill="#344078" opacity="0.08" transform="rotate(18 120 380)" />
        <ellipse cx="400" cy="140" rx="200" ry="128" fill="#403878" opacity="0.075" transform="rotate(-22 400 140)" />
        <rect width="512" height="512" rx="108" fill={`url(#${idVig})`} opacity="0.62" />
        <rect width="512" height="512" rx="108" fill="none" stroke={`url(#${idRim})`} strokeWidth="1.35" opacity="0.7" />

        <g className={motionDrift}>
          <g className={motionAura}>
            <ellipse cx="306" cy="162" rx="52" ry="44" fill={`url(#${idTipT})`} transform="rotate(-28 306 162)" />
            <ellipse cx="162" cy="434" rx="46" ry="40" fill={`url(#${idTipB})`} transform="rotate(18 162 434)" />
            {/* Haze emulation — wide strokes only (no SVG blur filter) */}
            <g strokeLinecap="round">
              <path d={NEBULA_PATH} fill="none" stroke="#43388a" strokeWidth="112" opacity="0.35" />
              <path d={NEBULA_PATH} fill="none" stroke="#3d4890" strokeWidth="94" opacity="0.42" />
              <path d={NEBULA_PATH} fill="none" stroke="#4a5698" strokeWidth="78" opacity="0.44" />
            </g>
          </g>

          <g strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d={NEBULA_PATH} stroke="#251a46" strokeWidth="84" opacity="0.38" />
            <path d={NEBULA_PATH} stroke="#30245c" strokeWidth="72" opacity="0.46" />
            <path d={NEBULA_PATH} stroke="#3a326e" strokeWidth="58" opacity="0.52" />
            <path d={NEBULA_PATH} stroke="#474a8e" strokeWidth="46" opacity="0.55" />
            <path d={NEBULA_PATH} stroke="#5a62a6" strokeWidth="34" opacity="0.57" />
            <path d={NEBULA_PATH} stroke="#7a8cc8" strokeWidth="23" opacity="0.56" />
            <path d={NEBULA_PATH} stroke="#aeb8e8" strokeWidth="12" opacity="0.52" />
            <path d={NEBULA_PATH} stroke="#e2e8f9" strokeWidth="6" opacity="0.42" />
          </g>

          <g fill="#d0daf0" opacity="1">
            <circle className={motionStarA} cx="382" cy="118" r="1.05" opacity="0.55" />
            <circle className={motionStarB} cx="102" cy="268" r="0.92" opacity="0.52" />
            <circle className={motionStarC} cx="312" cy="438" r="1" opacity="0.48" />
          </g>
        </g>
      </svg>
    </span>
  );
}
