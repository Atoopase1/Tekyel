'use client';

import { useEffect } from 'react';

export default function TouchRipple() {
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      // Find the closest interactive element
      const target = e.target as HTMLElement;
      if (!target || !target.closest) return;
      
      const interactiveEl = target.closest('button, a, [role="button"], .card, .ripple-active') as HTMLElement;
      
      // If none found or element is disabled, don't show ripple
      if (!interactiveEl || (interactiveEl as HTMLButtonElement).disabled) return;
      
      // Prevent multiple ripples from building up excessively
      if (interactiveEl.getElementsByClassName('ripple-span').length > 3) return;

      const rect = interactiveEl.getBoundingClientRect();
      const diameter = Math.max(rect.width, rect.height);
      const radius = diameter / 2;

      // Create the ripple element
      const ripple = document.createElement('span');
      ripple.className = 'ripple-span';
      ripple.style.width = ripple.style.height = `${diameter}px`;
      ripple.style.left = `${e.clientX - rect.left - radius}px`;
      ripple.style.top = `${e.clientY - rect.top - radius}px`;

      // Set position context on parent if needed
      const computedStyle = window.getComputedStyle(interactiveEl);
      if (computedStyle.position === 'static') {
        interactiveEl.style.position = 'relative';
      }
      interactiveEl.style.overflow = 'hidden';

      interactiveEl.appendChild(ripple);

      // Clean up the ripple element after animation
      setTimeout(() => {
        if (ripple && ripple.parentNode) {
          ripple.remove();
        }
      }, 600);
    };

    // Use pointerdown to support touch and mouse universally
    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, []);

  return null;
}
