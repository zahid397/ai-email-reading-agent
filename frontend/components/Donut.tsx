interface Segment {
  name: string;
  count: number;
  color: string;
}

/** Lightweight SVG donut. No external charting dependency. */
export function Donut({ segments, size = 132, thickness = 16 }: {
  segments: Segment[];
  size?: number;
  thickness?: number;
}) {
  const total = segments.reduce((sum, s) => sum + s.count, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let offset = 0;
  const arcs = segments.map((s) => {
    const fraction = total > 0 ? s.count / total : 0;
    const dash = fraction * circumference;
    const arc = {
      color: s.color,
      dashArray: `${dash} ${circumference - dash}`,
      dashOffset: -offset,
    };
    offset += dash;
    return arc;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="hsl(240 8% 16%)"
        strokeWidth={thickness}
      />
      {total > 0 &&
        arcs.map((arc, i) => (
          <circle
            key={i}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={arc.color}
            strokeWidth={thickness}
            strokeDasharray={arc.dashArray}
            strokeDashoffset={arc.dashOffset}
            strokeLinecap="butt"
            transform={`rotate(-90 ${center} ${center})`}
          />
        ))}
      <text
        x={center}
        y={center - 4}
        textAnchor="middle"
        className="fill-foreground text-xl font-semibold"
      >
        {total}
      </text>
      <text
        x={center}
        y={center + 14}
        textAnchor="middle"
        className="fill-muted-foreground text-[10px] uppercase tracking-wide"
      >
        emails
      </text>
    </svg>
  );
}
