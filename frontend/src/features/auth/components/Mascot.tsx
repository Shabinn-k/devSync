// src/features/auth/components/Mascot.tsx
import { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const MAX_PUPIL_OFFSET = 5;

export const Mascot = () => {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const pupilX = useSpring(rawX, { stiffness: 120, damping: 14, mass: 0.4 });
  const pupilY = useSpring(rawY, { stiffness: 120, damping: 14, mass: 0.4 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      const normalizedX = (event.clientX - centerX) / centerX;
      const normalizedY = (event.clientY - centerY) / centerY;

      const clampedX = Math.max(-1, Math.min(1, normalizedX)) * MAX_PUPIL_OFFSET;
      const clampedY = Math.max(-1, Math.min(1, normalizedY)) * MAX_PUPIL_OFFSET;

      rawX.set(clampedX);
      rawY.set(clampedY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [rawX, rawY]);

  const EyePair = ({
    leftCx,
    rightCx,
    cy,
    r = 9,
  }: {
    leftCx: number;
    rightCx: number;
    cy: number;
    r?: number;
  }) => (
    <>
      <circle cx={leftCx} cy={cy} r={r} fill="white" />
      <motion.circle cx={leftCx} cy={cy} r={r * 0.42} fill="black" style={{ x: pupilX, y: pupilY }} />
      <circle cx={rightCx} cy={cy} r={r} fill="white" />
      <motion.circle cx={rightCx} cy={cy} r={r * 0.42} fill="black" style={{ x: pupilX, y: pupilY }} />
    </>
  );

  return (
    <svg
      viewBox="0 0 560 560"
      width={340}
      height={340}
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      role="img"
      aria-label="DevSync mascot illustration"
    >
      {/* Character 1 — tallest, back-left, most rotated */}
      <g transform="rotate(-8 210 300)">
        <rect x="120" y="60" width="180" height="480" rx="72" stroke="white" strokeWidth="2.5" />
        <EyePair leftCx={172} rightCx={242} cy={205} />
        <rect x="203" y="222" width="9" height="36" rx="4.5" fill="#9CA3AF" transform="rotate(6 207 240)" />
      </g>

      {/* Character 2 — medium, slightly rotated */}
      <g transform="rotate(-4 325 340)">
        <rect x="250" y="150" width="150" height="380" rx="60" stroke="white" strokeWidth="2.5" />
        <EyePair leftCx={300} rightCx={352} cy={232} r={8} />
      </g>

      {/* Character 3 — short capsule, upright */}
      <g>
        <rect x="410" y="260" width="140" height="300" rx="70" stroke="white" strokeWidth="2.5" />
        <EyePair leftCx={458} rightCx={502} cy={330} r={9} />
        <line x1="458" y1="360" x2="502" y2="360" stroke="white" strokeWidth="3" strokeLinecap="round" />
      </g>

      {/* Character 4 — big front dome, occludes the others' lower halves */}
      <path
        d="M20,560 L20,340 A220,220 0 0 1 460,340 L460,560 Z"
        fill="#000000"
        stroke="white"
        strokeWidth="2.5"
      />
      <EyePair leftCx={150} rightCx={190} cy={420} r={11} />
      <path d="M150,455 Q170,466 190,455" stroke="#9CA3AF" strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  );
};