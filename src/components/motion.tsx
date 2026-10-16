import { useEffect, useRef } from 'react';

/** Progressive enhancement: content stays readable if motion is unavailable. */
export function usePageMotion(pathname: string) {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const animations = new Set<Animation>();
    let observer: IntersectionObserver | undefined;
    let frame = 0;
    const scene = document.querySelector<HTMLElement>('[data-parallax]');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    function updateParallax() {
      frame = 0;
      if (scene && !reduced.matches && finePointer.matches) {
        scene.style.setProperty('--parallax-y', `${Math.min(window.scrollY * 0.055, 20)}px`);
      }
    }
    function onScroll() { if (!frame) frame = requestAnimationFrame(updateParallax); }
    function stop() {
      observer?.disconnect();
      animations.forEach(animation => animation.cancel());
      animations.clear();
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
      scene?.style.removeProperty('--parallax-y');
    }
    function start() {
      stop();
      if (reduced.matches) return;
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const element = entry.target as HTMLElement;
          observer?.unobserve(element);
          const animation = element.animate([
            { opacity: 0, transform: 'translateY(20px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ], { duration: 560, delay: Number(element.dataset.delay ?? 0), easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
          animations.add(animation);
          animation.onfinish = () => animations.delete(animation);
        });
      }, { threshold: 0.08 });
      document.querySelectorAll('[data-reveal]').forEach(element => observer?.observe(element));
      if (scene && finePointer.matches) window.addEventListener('scroll', onScroll, { passive: true });
    }
    start();
    reduced.addEventListener('change', start);
    return () => { stop(); reduced.removeEventListener('change', start); };
  }, [pathname]);
}

/** Keep the exact current price visible; animate its emphasis, never its value. */
export function Price({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const previous = useRef(value);
  useEffect(() => {
    if (previous.current === value) return;
    previous.current = value;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const animation = ref.current?.animate([
      { transform: 'translateY(3px)', color: '#533afd' },
      { transform: 'translateY(0)', color: 'inherit' },
    ], { duration: 280, easing: 'ease-out' });
    return () => animation?.cancel();
  }, [value]);
  return <span ref={ref} className="animated-price">{value}</span>;
}
