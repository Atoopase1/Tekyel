import { useEffect, useState, useRef } from 'react';

export function useInView(options?: IntersectionObserverInit) {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const target = ref.current;
    if (!target) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        // Disconnect once it becomes visible for lazy loaded images
        observer.disconnect();
      }
    }, options);

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [options]);

  return { ref, isInView };
}
