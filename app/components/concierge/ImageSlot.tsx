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
      "relative overflow-hidden rounded-2xl border border-[color:var(--edge)] bg-[color:var(--paper)] shadow-[0_22px_60px_rgba(0,0,0,0.55)]";
    const glow = "after:pointer-events-none after:absolute after:inset-0 after:content-['']";
    const tones: Record<Props["tone"], string> = {
      hero:
        "bg-[radial-gradient(1200px_760px_at_22%_12%,rgba(199,164,106,0.18),transparent_62%),radial-gradient(980px_720px_at_112%_20%,rgba(232,220,200,0.07),transparent_58%),linear-gradient(160deg,#0f0e0c_0%,#15120f_44%,#0b0b0a_100%)]",
      interior:
        "bg-[radial-gradient(900px_620px_at_30%_12%,rgba(232,220,200,0.10),transparent_62%),radial-gradient(980px_760px_at_110%_22%,rgba(199,164,106,0.16),transparent_58%),linear-gradient(160deg,#0b0b0a_0%,#15120f_52%,#0f0e0c_100%)]",
      desk:
        "bg-[radial-gradient(920px_680px_at_22%_16%,rgba(199,164,106,0.15),transparent_62%),radial-gradient(980px_760px_at_96%_32%,rgba(232,220,200,0.08),transparent_62%),linear-gradient(160deg,#0b0b0a_0%,#15120f_46%,#0f0e0c_100%)]",
      profile:
        "bg-[radial-gradient(980px_760px_at_18%_10%,rgba(232,220,200,0.08),transparent_60%),radial-gradient(980px_760px_at_108%_18%,rgba(199,164,106,0.14),transparent_62%),linear-gradient(160deg,#0f0e0c_0%,#15120f_52%,#0b0b0a_100%)]",
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
        "block h-full w-full rounded-2xl border border-[color:var(--edge)] object-cover shadow-[0_22px_60px_rgba(0,0,0,0.55)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onError={() => setFailed(true)}
    />
  );
}

