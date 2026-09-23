"use client";

type LogoProps = {
  size?: number;
  withWordmark?: boolean;
  className?: string;
};

export function Logo({
  size = 24,
  withWordmark = false,
  className = "",
}: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Black circular badge */}
        <circle cx="12" cy="12" r="11.5" fill="#000000" />
        <circle
          cx="12"
          cy="12"
          r="11.25"
          stroke="#1f1f22"
          strokeWidth="0.5"
          fill="none"
        />

        {/* Magnifier lens */}
        <circle
          cx="10.5"
          cy="10.5"
          r="4.6"
          stroke="#ffffff"
          strokeWidth="1.7"
          fill="none"
        />

        {/* Lens highlight (small arc top-left) */}
        <path
          d="M 8.2 9.2 A 2.6 2.6 0 0 1 9.6 8.2"
          stroke="#ffffff"
          strokeWidth="1.3"
          strokeLinecap="round"
          fill="none"
        />

        {/* Mention point inside lens */}
        <circle cx="11.8" cy="11.8" r="1.1" fill="#ffffff" />

        {/* Magnifier handle */}
        <path
          d="M 13.8 13.8 L 17.3 17.3"
          stroke="#ffffff"
          strokeWidth="1.9"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      {withWordmark && (
        <span className="text-[15px] font-semibold tracking-[-0.01em] text-[var(--color-text-primary)]">
          GeoScope
        </span>
      )}
    </span>
  );
}



