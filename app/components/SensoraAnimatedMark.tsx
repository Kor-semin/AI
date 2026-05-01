"use client";

/** Canonical in-app + generation source: replace `public/brand/sensora-logo.png` to re-run `npm run pwa-icons-v3`. */
const SENSORA_LOGO_SRC = "/brand/sensora-logo.png" as const;

/** Squircle radius matches 512px app icon art (rx ≈ 108). */
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
 * Sensora mark — official raster only (no alternate SVG interpretation).
 * Micro motion reuses global aura / drift keyframes.
 */
export function SensoraAnimatedMark({
  size = 88,
  className = "",
  animated = true,
  label,
}: SensoraAnimatedMarkProps) {
  const r = cornerRadiusPx(size);
  const motionAura = animated ? "sensora-mark-aura-layer" : "";
  const motionDrift = animated ? "sensora-mark-drift-layer" : "";

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
      <span className={`block size-full overflow-hidden ${motionDrift}`.trim()}>
        <span className={`block size-full overflow-hidden ${motionAura}`.trim()}>
          <img
            src={SENSORA_LOGO_SRC}
            alt=""
            width={size}
            height={size}
            className="pointer-events-none block size-full object-contain object-center align-top select-none"
            style={{ verticalAlign: "top" }}
            draggable={false}
            decoding="async"
          />
        </span>
      </span>
    </span>
  );
}
