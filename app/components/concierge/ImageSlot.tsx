"use client";

import { useMemo, useState } from "react";

type Props = {
  src: string;
  alt: string;
  className?: string;
  /** 이미지가 없을 때 플레이스홀더 톤 */
  tone?: "hero" | "interior" | "desk" | "profile";
};

export function ImageSlot({ src, alt, className, tone = "hero" }: Props) {
  const [failed, setFailed] = useState(false);

  const placeholder = useMemo(() => {
    const base =
      "relative overflow-hidden rounded-2xl border border-[color:var(--edge)] bg-[color:var(--paper-2)] shadow-[0_14px_44px_rgba(17,19,24,0.08)]";
    const glow = "after:pointer-events-none after:absolute after:inset-0 after:content-['']";
    const tones: Record<NonNullable<Props["tone"]>, string> = {
      hero:
        "bg-[radial-gradient(1000px_640px_at_18%_12%,rgba(168,176,186,0.22),transparent_62%),radial-gradient(860px_560px_at_100%_28%,rgba(100,116,139,0.12),transparent_58%),linear-gradient(160deg,#1a1e24_0%,#111318_50%,#181b20_100%)]",
      interior:
        "bg-[radial-gradient(900px_620px_at_30%_14%,rgba(241,245,249,0.9),transparent_60%),radial-gradient(900px_620px_at_100%_22%,rgba(148,163,184,0.2),transparent_58%),linear-gradient(160deg,#e8ecf2_0%,#f1f5f9_48%,#dfe4eb_100%)]",
      desk:
        "bg-[radial-gradient(880px_600px_at_20%_14%,rgba(168,176,186,0.2),transparent_60%),radial-gradient(900px_620px_at_96%_26%,rgba(71,85,105,0.1),transparent_60%),linear-gradient(160deg,#1c2027_0%,#13161c_52%,#181b20_100%)]",
      profile:
        "bg-[radial-gradient(920px_620px_at_16%_12%,rgba(226,232,240,0.75),transparent_58%),radial-gradient(900px_620px_at_106%_14%,rgba(148,163,184,0.18),transparent_60%),linear-gradient(160deg,#f8fafc_0%,#eef1f6_52%,#e2e8f0_100%)]",
    };
    const sheen =
      "after:bg-[radial-gradient(600px_220px_at_20%_8%,rgba(255,255,255,0.09),transparent_60%),radial-gradient(520px_260px_at_90%_22%,rgba(255,255,255,0.04),transparent_58%)]";
    return [base, glow, tones[tone], sheen].join(" ");
  }, [tone]);

  if (failed) {
    return <div aria-hidden className={[placeholder, className].filter(Boolean).join(" ")} />;
  }

  // eslint-disable-next-line @next/next/no-img-element -- public/images 교체용 슬롯
  return (
    <img
      src={src}
      alt={alt}
      className={[
        "block h-full w-full rounded-2xl border border-[color:var(--edge)] object-cover shadow-[0_14px_40px_rgba(17,19,24,0.1)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onError={() => setFailed(true)}
    />
  );
}

