'use client';

import { useEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function ScrollTriggerRefresh() {
  useEffect(() => {
    // Refresh after images and fonts load
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    // Also refresh on resize
    window.addEventListener('resize', refresh);
    return () => {
      window.removeEventListener('load', refresh);
      window.removeEventListener('resize', refresh);
    };
  }, []);
  return null;
}
