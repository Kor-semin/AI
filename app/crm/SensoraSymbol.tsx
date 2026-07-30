/**
 * 브랜드 심볼 — BX 가이드라인(public/brand/sensora-symbol.png)의 부채꼴 패널을 SVG로 재현.
 * 중심점에서 오른쪽으로 확장되는 5개 패널, 로고 원본에서 추출한 와인·로즈 톤을 사용합니다.
 * (#820229 / #A22B43 / #DD8D92 / #C5626D)
 */
export function SensoraSymbol({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden focusable="false">
      {[
        ["M3 16 30 2.4 30 7.4Z", "#820229"],
        ["M3 16 30 8.6 30 12.9Z", "#A22B43"],
        ["M3 16 30 14.1 30 17.9Z", "#DD8D92"],
        ["M3 16 30 19.1 30 23.4Z", "#C5626D"],
        ["M3 16 30 24.6 30 29.6Z", "#820229"],
      ].map(([d, color]) => (
        <path key={d} d={d} fill={color} stroke={color} strokeWidth="1.1" strokeLinejoin="round" />
      ))}
    </svg>
  );
}
