import { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const MAX_PUPIL_OFFSET = 10;

export const Mascot = () => {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const pupilX = useSpring(rawX, { stiffness: 300, damping: 20, mass: 0.2 });
  const pupilY = useSpring(rawY, { stiffness: 300, damping: 20, mass: 0.2 });

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
    r,
  }: {
    leftCx: number;
    rightCx: number;
    cy: number;
    r: number;
  }) => (
    <>
      <circle cx={leftCx} cy={cy} r={r} fill="white" />
      <motion.circle
        cx={leftCx}
        cy={cy}
        r={r * 0.42}
        fill="black"
        style={{ x: pupilX, y: pupilY }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />
      <circle cx={rightCx} cy={cy} r={r} fill="white" />
      <motion.circle
        cx={rightCx}
        cy={cy}
        r={r * 0.42}
        fill="black"
        style={{ x: pupilX, y: pupilY }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />
    </>
  );

  return (
    <svg
      viewBox="0 0 760 640"
      width={450}
      height={450}
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      role="img"
      aria-label="DevSync mascot illustration"
    >
      <g>
        <rect x="385" y="195" width="165" height="345" rx="40" stroke="white" strokeWidth="2" />
        <EyePair leftCx={440} rightCx={495} cy={265} r={12} />
      </g>

      <g>
        <rect x="555" y="235" width="140" height="305" rx="70" stroke="white" strokeWidth="2" />
        <EyePair leftCx={600} rightCx={650} cy={305} r={11} />
        <line x1="600" y1="335" x2="650" y2="335" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      </g>

      <g transform="rotate(-6 320 190)">
        <rect x="225" y="15" width="195" height="345" rx="45" stroke="white" strokeWidth="2" />
        <EyePair leftCx={300} rightCx={365} cy={95} r={13} />
        <rect x="326" y="130" width="10" height="40" rx="5" fill="#9CA3AF" />
      </g>

      <g>
        <path d="M40,630 L40,365 A180,180 0 0 1 400,365 L400,630 Z" stroke="white" strokeWidth="2" fill="black" />
        <EyePair leftCx={160} rightCx={215} cy={460} r={15} />
        <path d="M160,500 Q188,515 216,500" stroke="#9CA3AF" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
};