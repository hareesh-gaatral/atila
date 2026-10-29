'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  /** Animation direction: up (default), left, right, or zoom. */
  variant?: 'up' | 'left' | 'right' | 'zoom';
  /** Stagger delay in ms when used inside a grid (passed via style). */
  delay?: number;
  className?: string;
}

const variantClasses: Record<string, string> = {
  up: 'translate-y-8',
  left: '-translate-x-10',
  right: 'translate-x-10',
  zoom: 'scale-95',
};

/**
 * Fades/slides children in once they enter the viewport. Respects
 * prefers-reduced-motion (content is simply shown immediately).
 */
export default function ScrollReveal({ children, variant = 'up', delay = 0, className = '' }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${className} transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-x-0 translate-y-0 scale-100' : `opacity-0 ${variantClasses[variant]}`
      }`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
