'use client';
import { useEffect } from 'react';
import { useStore } from '@/lib/store';

/**
 * Syncs the Zustand isDarkMode flag to the <html> element's `dark` class.
 * Must be rendered inside the client boundary (inside <body>).
 */
export default function ThemeProvider() {
  const isDarkMode = useStore((s) => s.isDarkMode);

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  return null;
}
