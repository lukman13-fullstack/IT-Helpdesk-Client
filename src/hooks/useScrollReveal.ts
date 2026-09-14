import { useEffect, useRef } from "react";

/**
 * Hook that sets up IntersectionObserver to add 'revealed' class
 * to elements with scroll-reveal classes when they enter the viewport.
 * 
 * Usage: call useScrollReveal() in any component that has elements
 * with className="scroll-reveal" (or scroll-reveal-left / scroll-reveal-scale).
 * The hook will automatically observe all matching elements.
 */
export function useScrollReveal(rootSelector?: string) {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const root = rootSelector
      ? document.querySelector(rootSelector)
      : null;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            // Stop observing once revealed (one-time animation)
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      {
        root: root,
        rootMargin: "0px 0px -60px 0px",
        threshold: 0.1,
      }
    );

    // Find all scroll-reveal elements in the DOM
    const elements = document.querySelectorAll(
      ".scroll-reveal:not(.revealed), .scroll-reveal-left:not(.revealed), .scroll-reveal-scale:not(.revealed)"
    );

    elements.forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [rootSelector]);
}

export default useScrollReveal;
