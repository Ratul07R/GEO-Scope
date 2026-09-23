import type { CSSProperties } from "react";

type SparklineProps = {
  data: number[];
  color: string;
  animated?: boolean;
};

type AreaChartProps = {
  data: number[];
  animated?: boolean;
};

/* Safe dash length for the trend line: longer than any realistic path
   in this 320x96 viewBox, so the stroke always finishes drawing. */
const AREA_PATH_LENGTH = 2000;

function polylineLength(points: { x: number; y: number }[]): number {
  let length = 0;
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    length += Math.hypot(current.x - previous.x, current.y - previous.y);
  }
  return length;
}

export function Sparkline({ data, color, animated = false }: SparklineProps) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 58; /* plot area */
  const svgWidth = 64; /* full svg width: leaves a 6px right gutter for the live dot */
  const height = 22;
  const pointList = data.map((value, index) => ({
    x: (index / (data.length - 1)) * width,
    y: height - ((value - min) / range) * (height - 4) - 2,
  }));
  const points = pointList
    .map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`)
    .join(" ");
  /* Exact geometry length, so the draw animation never leaves a gap. */
  const pathLength = Math.max(polylineLength(pointList), 1).toFixed(2);

  return (
    <svg
      width={svgWidth}
      height={height}
      viewBox={`0 0 ${svgWidth} ${height}`}
      fill="none"
      aria-hidden
      className="shrink-0 opacity-70 transition-opacity group-hover:opacity-100"
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={animated ? "animate-draw-path" : undefined}
        style={
          animated
            ? ({
                strokeDasharray: pathLength,
                "--path-length": pathLength,
              } as CSSProperties)
            : undefined
        }
      />
      {animated && pointList.length > 0 && (() => {
        const last = pointList[pointList.length - 1];
        return (
          <g>
            <circle
              cx={last.x}
              cy={last.y}
              r="3"
              fill={color}
              opacity="0.3"
              className="live-dot"
              style={{
                transformBox: "fill-box",
                transformOrigin: "center",
                animationDelay: `${(color.charCodeAt(1) % 7) * 200}ms`,
              }}
            />
            <circle
              cx={last.x}
              cy={last.y}
              r="1.8"
              fill={color}
            />
          </g>
        );
      })()}
    </svg>
  );
}

export function AreaChart({ data, animated = false }: AreaChartProps) {
  const width = 320;
  const height = 96;
  const max = Math.max(...data);
  const min = Math.min(...data) * 0.85;
  const range = max - min || 1;
  const points = data.map((value, index) => ({
    x: (index / (data.length - 1)) * width,
    y: height - ((value - min) / range) * height,
  }));
  const line = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(2)},${point.y.toFixed(2)}`)
    .join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;
  const lineStyle = animated
    ? ({
        strokeDasharray: "var(--path-length)",
        "--path-length": String(AREA_PATH_LENGTH),
      } as CSSProperties)
    : undefined;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        fill="none"
        aria-hidden
        className={`${animated ? "chart-breath overflow-visible " : ""}h-24 w-full`}
      >
        <defs>
          <linearGradient id="visibility-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5e6ad2" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#5e6ad2" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={area}
          fill="url(#visibility-area)"
          className={animated ? "opacity-0 animate-[fadeIn_800ms_600ms_forwards]" : undefined}
        />
        <path
          d={line}
          stroke="#5e6ad2"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          className={animated ? "animate-draw-path" : undefined}
          style={lineStyle}
        />

        {animated && points.length > 0 && (() => {
          const last = points[points.length - 1];
          const prev = points[points.length - 2] ?? last;
          const dx = last.x - prev.x;
          const dy = last.y - prev.y;
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);
          return (
            <g>
              <circle
                cx={last.x}
                cy={last.y}
                r="6"
                fill="#5e6ad2"
                opacity="0.25"
                className="live-dot"
              />
              <circle
                cx={last.x}
                cy={last.y}
                r="3"
                fill="#5e6ad2"
              />
              <path
                d={`M ${last.x} ${last.y} l 20 0`}
                stroke="#5e6ad2"
                strokeWidth="1.5"
                strokeDasharray="2 2"
                transform={`rotate(${angle} ${last.x} ${last.y})`}
                opacity="0.4"
              />
            </g>
          );
        })()}
      </svg>

      {animated && <div className="chart-shimmer rounded-md" />}
    </div>
  );
}