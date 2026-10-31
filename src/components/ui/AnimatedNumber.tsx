import React, { useState, useEffect, useRef } from 'react';
import { useRefresh } from '../../context/RefreshContext';

export interface AnimatedNumberProps {
  value: number;
  duration?: number;
  delay?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  showGlow?: boolean;
  format?: (num: number) => string;
}

function getDecimals(num: number): number {
  if (!isFinite(num) || Math.floor(num) === num) return 0;
  const str = num.toString();
  if (str.includes('.')) {
    return Math.min(str.split('.')[1].length, 4);
  }
  return 0;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 700,
  delay = 0,
  decimals,
  prefix = '',
  suffix = '',
  className = '',
  showGlow = true,
  format,
}) => {
  const { refreshKey } = useRefresh();
  const [displayValue, setDisplayValue] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [justFinished, setJustFinished] = useState<boolean>(false);

  const prevValueRef = useRef<number>(0);
  const prevRefreshKeyRef = useRef<number>(refreshKey);
  const resolvedDecimals = decimals !== undefined ? decimals : getDecimals(value);

  useEffect(() => {
    // Check for prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayValue(value);
      prevValueRef.current = value;
      return;
    }

    const isRefresh = prevRefreshKeyRef.current !== refreshKey;
    prevRefreshKeyRef.current = refreshKey;

    // If website refreshed/mounted, count up from 0; if value changed live, glide from previous value
    const startVal = isRefresh ? 0 : prevValueRef.current;
    const endVal = isFinite(value) ? value : 0;
    const diff = endVal - startVal;

    let rafId: number;
    let startTime: number | null = null;

    setIsAnimating(true);
    setJustFinished(false);

    const timeoutId = setTimeout(() => {
      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / Math.max(duration, 100), 1);

        // easeOutExpo for snappy start and smooth deceleration
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const current = startVal + diff * eased;

        setDisplayValue(current);

        if (progress < 1) {
          rafId = requestAnimationFrame(step);
        } else {
          setDisplayValue(endVal);
          prevValueRef.current = endVal;
          setIsAnimating(false);
          setJustFinished(true);
          const finishTimeout = setTimeout(() => setJustFinished(false), 240);
          return () => clearTimeout(finishTimeout);
        }
      };

      rafId = requestAnimationFrame(step);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [value, duration, delay, refreshKey, resolvedDecimals]);

  const formattedNumber = format
    ? format(displayValue)
    : resolvedDecimals > 0
    ? displayValue.toFixed(resolvedDecimals)
    : Math.round(displayValue).toLocaleString();

  return (
    <span
      className={`inline-block tabular-nums transition-all duration-200 ${
        isAnimating && showGlow
          ? 'text-[#FF7452] filter drop-shadow-[0_0_8px_rgba(255,94,54,0.35)]'
          : justFinished
          ? 'scale-[1.03] text-[#F7F6F9]'
          : ''
      } ${className}`}
      style={{ fontVariantNumeric: 'tabular-nums' }}
    >
      {prefix}
      {formattedNumber}
      {suffix}
    </span>
  );
};
