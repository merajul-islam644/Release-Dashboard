import { useMemo, useState } from "react";

export type SeriesConfig = { key: string; label: string; color: string };

export type ChartPoint = { label: string; values: Record<string, number> };

export function HealthChart({ points, series, height = 220 }: { points: ChartPoint[]; series: SeriesConfig[]; height?: number }) {
  const [hoverIndex, setHoverIndex] = useState<number | undefined>();
  const width = 640;

  const max = useMemo(() => {
    let m = 1;
    points.forEach((p) => series.forEach((s) => { const v = p.values[s.key] ?? 0; if (v > m) m = v; }));
    return m;
  }, [points, series]);

  const step = points.length > 1 ? width / (points.length - 1) : width;

  function x(index: number): number {
    return points.length > 1 ? index * step : 0;
  }

  function y(value: number): number {
    return height - 8 - (value / max) * (height - 24);
  }

  if (points.length === 0) {
    return <div className="chart-empty">No health data for this range.</div>;
  }

  const hovered = hoverIndex !== undefined ? points[hoverIndex] : undefined;

  return (
    <div className="chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" onMouseLeave={() => setHoverIndex(undefined)}>
        {series.map((s) => (
          <polyline
            key={s.key}
            className="chart-line"
            points={points.map((p, i) => `${x(i)},${y(p.values[s.key] ?? 0)}`).join(" ")}
            fill="none"
            stroke={s.color}
            strokeWidth={2}
          />
        ))}
        {hoverIndex !== undefined ? (
          <g>
            {series.map((s) => {
              const point = points[hoverIndex];
              if (!point) return null;
              return <circle key={s.key} cx={x(hoverIndex)} cy={y(point.values[s.key] ?? 0)} r={4} fill={s.color} />;
            })}
          </g>
        ) : null}
        {points.map((_, i) => (
          <rect key={i} className="chart-hit" x={x(i) - step / 2} y={0} width={step} height={height} onMouseEnter={() => setHoverIndex(i)} />
        ))}
      </svg>
      {hovered ? (
        <div className="chart-tooltip" style={{ left: Math.min(x(hoverIndex ?? 0), width - 160), top: 0 }}>
          <strong>{hovered.label}</strong>
          {series.map((s) => (
            <span key={s.key} style={{ color: s.color }}>
              {s.label}: {hovered.values[s.key] ?? 0}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}