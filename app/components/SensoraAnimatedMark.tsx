"use client";

import { useId } from "react";

const NEBULA_PATH =
  "M 306 162 C 184 162 126 230 126 292 C 126 348 204 380 268 390 C 328 400 386 438 386 492 C 386 536 328 554 242 542 C 192 532 162 484 162 434";

/** Squircle radius matches PWA art (rx=108 in 512 viewBox). */
function cornerRadiusPx(size: number): number {
  return (size * 108) / 512;
}

export type SensoraAnimatedMarkProps = {
  size?: number;
  className?: string;
  animated?: boolean;
  label?: string;
};

/**
 * In-app Quiet Nebula S — wide ribbon (no SVG blur bleed), deep midnight plate, clipped squircle.
 * Visual language aligned with PWA v2 raster; renders as vector-only wide strokes + soft haze stack.
 */
export function SensoraAnimatedMark({
  size = 88,
  className = "",
  animated = true,
  label,
}: SensoraAnimatedMarkProps) {
  const rid = useId().replace(/:/g, "");
  const r = cornerRadiusPx(size);

  const idBg = `${rid}-bg`;
  const idWash = `${rid}-wash`;
  const idWash2 = `${rid}-wash2`;
  const idVig = `${rid}-vig`;
  const idRim = `${rid}-rim`;
  const idTipT = `${rid}-tipT`;
  const idTipB = `${rid}-tipB`;
  const idClip = `${rid}-squircle`;

  const motionAura = animated ? "sensora-mark-aura-layer" : "";
  const motionDrift = animated ? "sensora-mark-drift-layer" : "";
  const shStar = (k: "a" | "b") =>
    animated ? `sensora-mark-star sensora-mark-star--${k}` : "sensora-mark-star";

  return (
    <span
      className={`sensora-animated-mark pointer-events-none inline-block shrink-0 select-none align-middle leading-none ${className}`.trim()}
      style={{
        width: size,
        height: size,
        borderRadius: r,
        backgroundColor: "#02040c",
        overflow: "hidden",
      }}
      role={label ? "img" : undefined}
      aria-label={label ?? undefined}
      aria-hidden={label ? undefined : true}
    >
      <svg
        className="block size-full overflow-hidden"
        style={{ verticalAlign: "top" }}
        viewBox="0 0 512 512"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
        focusable="false"
      >
        <defs>
          <clipPath id={idClip}>
            <rect width="512" height="512" rx="108" ry="108" />
          </clipPath>
          <radialGradient id={idBg} cx="42%" cy="34%" r="92%">
            <stop offset="0%" stopColor="#152542" />
            <stop offset="38%" stopColor="#0e1628" />
            <stop offset="72%" stopColor="#060a14" />
            <stop offset="100%" stopColor="#02040a" />
          </radialGradient>
          <radialGradient id={idWash} cx="28%" cy="22%" r="65%">
            <stop offset="0%" stopColor="#2a3868" stopOpacity="0.22" />
            <stop offset="55%" stopColor="#283060" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#1a2548" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={idWash2} cx="82%" cy="78%" r="58%">
            <stop offset="0%" stopColor="#3a3568" stopOpacity="0.18" />
            <stop offset="60%" stopColor="#2c2850" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#181428" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={idVig} cx="50%" cy="46%" r="72%">
            <stop offset="55%" stopColor="#020306" stopOpacity="0" />
            <stop offset="100%" stopColor="#010208" stopOpacity="0.52" />
          </radialGradient>
          <linearGradient id={idRim} x1="8%" y1="4%" x2="94%" y2="96%">
            <stop offset="0%" stopColor="#1a2840" />
            <stop offset="100%" stopColor="#060a14" />
          </linearGradient>
          <radialGradient id={idTipT} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7380b8" stopOpacity="0.42" />
            <stop offset="50%" stopColor="#56608c" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#383e5c" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={idTipB} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6880aa" stopOpacity="0.38" />
            <stop offset="50%" stopColor="#4a5878" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#2c3448" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g clipPath={`url(#${idClip})`}>
          <rect width="512" height="512" fill="#02040c" />
          <rect width="512" height="512" fill={`url(#${idBg})`} />
          <rect width="512" height="512" fill={`url(#${idWash})`} />
          <rect width="512" height="512" fill={`url(#${idWash2})`} />
          <ellipse cx="120" cy="380" rx="240" ry="150" fill="#344078" opacity="0.075" transform="rotate(18 120 380)" />
          <ellipse cx="400" cy="140" rx="200" ry="128" fill="#403878" opacity="0.068" transform="rotate(-22 400 140)" />
          <rect width="512" height="512" fill={`url(#${idVig})`} opacity="0.7" />

          <g className={motionDrift}>
            <g className={motionAura}>
              <ellipse cx="306" cy="162" rx="54" ry="46" fill={`url(#${idTipT})`} transform="rotate(-28 306 162)" />
              <ellipse cx="162" cy="434" rx="48" ry="41" fill={`url(#${idTipB})`} transform="rotate(18 162 434)" />
              {/* Outer haze — wide strokes only (no SVG blur → no corner bleed / white halo) */}
              <g strokeLinecap="round" strokeLinejoin="round" fill="none">
                <path d={NEBULA_PATH} stroke="#241c48" strokeWidth="154" opacity="0.14" />
                <path d={NEBULA_PATH} stroke="#2c2458" strokeWidth="134" opacity="0.2" />
                <path d={NEBULA_PATH} stroke="#362c6e" strokeWidth="116" opacity="0.26" />
                <path d={NEBULA_PATH} stroke="#40347e" strokeWidth="100" opacity="0.3" />
                <path d={NEBULA_PATH} stroke="#4a3c8e" strokeWidth="86" opacity="0.32" />
              </g>
            </g>

            {/* Nebula ribbon S: 8 wide layers; inner core stays soft (no thin bright “LED” cap stroke) */}
            <g strokeLinecap="round" strokeLinejoin="round" fill="none">
              <path d={NEBULA_PATH} stroke="#1a1436" strokeWidth="90" opacity="0.5" />
              <path d={NEBULA_PATH} stroke="#241a4a" strokeWidth="78" opacity="0.52" />
              <path d={NEBULA_PATH} stroke="#2f2260" strokeWidth="66" opacity="0.54" />
              <path d={NEBULA_PATH} stroke="#3c2e78" strokeWidth="55" opacity="0.54" />
              <path d={NEBULA_PATH} stroke="#4d4090" strokeWidth="44" opacity="0.52" />
              <path d={NEBULA_PATH} stroke="#5f54a6" strokeWidth="34" opacity="0.48" />
              <path d={NEBULA_PATH} stroke="#7a78bf" strokeWidth="24" opacity="0.42" />
              <path d={NEBULA_PATH} stroke="#9aa6d6" strokeWidth="14" opacity="0.34" />
            </g>

            <g fill="#b8c4e8">
              <circle className={shStar("a")} cx="394" cy="108" r="0.92" opacity="0.084" />
              <circle className={shStar("b")} cx="122" cy="282" r="0.82" opacity="0.068" />
            </g>

            <rect
              width="512"
              height="512"
              rx="108"
              ry="108"
              fill="none"
              stroke={`url(#${idRim})`}
              strokeWidth={2}
              opacity="0.55"
            />
          </g>
        </g>
      </svg>
    </span>
  );
}
