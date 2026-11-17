'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';

interface EgyptXLogoProps {
  className?: string;
  size?: 'navbar' | 'footer' | 'hero';
  forceDark?: boolean;
}

export default function EgyptXLogo({
  className = '',
  size = 'navbar',
  forceDark = false,
}: EgyptXLogoProps) {
  const { theme } = useTheme();
  const isLightMode = !forceDark && theme === 'light';
  const src = isLightMode ? '/images/logo/logo-light.png' : '/images/logo/logo-dark.png';

  const sizeClass =
    size === 'hero'
      ? 'h-20 sm:h-28 md:h-32 w-auto mx-auto object-contain'
      : size === 'footer'
      ? 'h-10 sm:h-12 w-auto object-contain'
      : 'h-7 sm:h-8 md:h-9 w-auto max-w-[120px] object-contain';

  return (
    <div className={`flex items-center justify-center shrink-0 ${className}`}>
      <img
        src={src}
        alt="EgyptX"
        className={`${sizeClass} select-none pointer-events-none`}
      />
    </div>
  );
}
