export interface WheelEntry {
  id: string;
  name: string;
}

export interface SpinTarget {
  /** Index into the entries array the wheel must land on. */
  index: number;
  /** Unique per spin (e.g. Date.now()) — also seeds the landing jitter. */
  nonce: number;
  /** 1-based spin counter — keeps the rotation monotonically increasing. */
  seq: number;
  /** Entries count at spin time, so the landing angle stays stable if the list shrinks afterwards. */
  count: number;
}

interface LuckyWheelProps {
  entries: WheelEntry[];
  /** The wheel is fully controlled: setting a new target starts the spin. */
  target: SpinTarget | null;
  onSpinEnd: () => void;
  className?: string;
}

// Cycle of 4 so neighbours always differ
const SEGMENT_FILLS = ["#45B75A", "#0A2A1F", "#B4D337", "#0B5332"];
const TEXT_FILLS = ["#04150F", "#45B75A", "#1A2405", "#FFFFFF"];

const CX = 200;
const CY = 200;
const R = 188;
export const SPIN_SECONDS = 7;

function polar(angleDeg: number, radius: number): [number, number] {
  const rad = (angleDeg * Math.PI) / 180;
  return [CX + radius * Math.cos(rad), CY + radius * Math.sin(rad)];
}

function segmentPath(startDeg: number, endDeg: number): string {
  const [x0, y0] = polar(startDeg, R);
  const [x1, y1] = polar(endDeg, R);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${CX} ${CY} L ${x0} ${y0} A ${R} ${R} 0 ${largeArc} 1 ${x1} ${y1} Z`;
}

/**
 * Rotation that puts the target segment's centre under the top pointer
 * (270° in SVG clockwise coordinates). Deterministic in the target, so the
 * component needs no state: each spin's seq adds full turns, and the nonce
 * adds jitter within the segment so landings don't look staged.
 */
function rotationFor(target: SpinTarget): number {
  const seg = 360 / Math.max(1, target.count);
  const centre = target.index * seg + seg / 2;
  const jitter = ((target.nonce % 997) / 997 - 0.5) * seg * 0.6;
  return target.seq * 9 * 360 + (270 - centre + jitter);
}

function fontSize(count: number): number {
  if (count <= 8) return 17;
  if (count <= 14) return 13;
  if (count <= 22) return 10;
  return 8;
}

function truncate(name: string, count: number): string {
  const max = count <= 8 ? 18 : count <= 14 ? 14 : 11;
  return name.length > max ? `${name.slice(0, max - 1)}…` : name;
}

export function LuckyWheel({ entries, target, onSpinEnd, className }: LuckyWheelProps) {
  const n = entries.length;
  const seg = 360 / Math.max(1, n);
  const rotation = target ? rotationFor(target) : 0;

  return (
    <div className={className}>
      <div className="relative mx-auto aspect-square w-full max-w-[min(80vw,520px)]">
        {/* Projector spotlight glow behind the wheel */}
        <div className="pointer-events-none absolute -inset-10 rounded-full bg-[radial-gradient(circle,rgba(69,183,90,0.16),transparent_65%)]" />

        {/* Pointer — wobble lives on the inner svg so it never fights the
            wrapper's centering translate */}
        <div className="absolute -top-2 left-1/2 z-10 w-10 -translate-x-1/2 drop-shadow-lg">
          <svg viewBox="0 0 40 40" className="pointer-bob w-full">
            <path d="M20 38 L4 6 L36 6 Z" fill="#B4D337" stroke="#FFFFFF" strokeWidth="3" />
          </svg>
        </div>

        {/* Wheel */}
        <div
          className="size-full"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: target
              ? `transform ${SPIN_SECONDS}s cubic-bezier(0.12, 0.85, 0.08, 1)`
              : "none",
          }}
          onTransitionEnd={(e) => {
            if (e.propertyName === "transform") onSpinEnd();
          }}
        >
          <svg viewBox="0 0 400 400" className="size-full drop-shadow-2xl">
            <circle cx={CX} cy={CY} r={R + 8} fill="#04120F" stroke="#45B75A" strokeWidth="7" />
            {/* Carnival rim bulbs — children of the rotating group, so they
                orbit during the spin; opacity blink never touches transforms */}
            {Array.from({ length: 16 }, (_, i) => {
              const [bx, by] = polar(i * 22.5, R + 8);
              return (
                <circle
                  key={i}
                  cx={bx}
                  cy={by}
                  r="4"
                  fill="#EFFAF3"
                  className="wheel-bulb"
                  style={{ animationDelay: `${i * 0.12}s` }}
                />
              );
            })}
            {n === 0 ? (
              <circle cx={CX} cy={CY} r={R} fill="#0A2A1F" />
            ) : n === 1 ? (
              <circle cx={CX} cy={CY} r={R} fill={SEGMENT_FILLS[0]} />
            ) : (
              entries.map((entry, i) => (
                <path
                  key={entry.id}
                  d={segmentPath(i * seg, (i + 1) * seg)}
                  fill={SEGMENT_FILLS[i % SEGMENT_FILLS.length]}
                  stroke="#04120F"
                  strokeWidth="1.5"
                />
              ))
            )}
            {entries.map((entry, i) => {
              const mid = i * seg + seg / 2;
              const [x, y] = polar(mid, R * 0.62);
              return (
                <text
                  key={entry.id}
                  x={x}
                  y={y}
                  transform={`rotate(${mid} ${x} ${y})`}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={fontSize(n)}
                  fontWeight="700"
                  fill={n === 1 ? TEXT_FILLS[0] : TEXT_FILLS[i % TEXT_FILLS.length]}
                  style={{ fontFamily: "Cairo, sans-serif" }}
                >
                  {truncate(entry.name, n)}
                </text>
              );
            })}
            <circle cx={CX} cy={CY} r="26" fill="#04120F" stroke="#45B75A" strokeWidth="5" />
            {/* WE ARE 26 logo hub — 36px square fits inside the r=26 circle */}
            <image href="/images/logo.png" x={CX - 18} y={CY - 18} width="36" height="36" />
          </svg>
        </div>
      </div>
    </div>
  );
}
