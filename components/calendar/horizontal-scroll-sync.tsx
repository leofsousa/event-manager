"use client";

import {
  useRef,
  useCallback,
  useState,
  useEffect,
  type ReactNode,
  type WheelEvent as ReactWheelEvent,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { CALENDAR_DAY_WIDTH } from "@/components/calendar/calendar-timeline";

type Props = {
  children: ReactNode;
  contentWidth: number;
  className?: string;
};

export default function HorizontalScrollSync({
  children,
  contentWidth,
  className = "",
}: Props) {
  const mainRef = useRef<HTMLDivElement>(null);
  const lockRef = useRef(false);
  const dragRef = useRef({ active: false, startX: 0, startScroll: 0 });

  const [scrollLeft, setScrollLeft] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);

  const applyScroll = useCallback((left: number) => {
    const el = mainRef.current;
    if (!el) return;

    const max = Math.max(0, el.scrollWidth - el.clientWidth);
    const next = Math.max(0, Math.min(left, max));

    lockRef.current = true;
    el.scrollLeft = next;
    setScrollLeft(next);
    setMaxScroll(max);
    lockRef.current = false;
  }, []);

  const updateMetrics = useCallback(() => {
    const el = mainRef.current;
    if (!el) return;

    const max = Math.max(0, el.scrollWidth - el.clientWidth);
    setMaxScroll(max);
    setScrollLeft(el.scrollLeft);
  }, []);

  useEffect(() => {
    updateMetrics();

    const el = mainRef.current;
    if (!el) return;

    const observer = new ResizeObserver(updateMetrics);
    observer.observe(el);

    return () => observer.disconnect();
  }, [contentWidth, updateMetrics]);

  const scrollBy = useCallback(
    (delta: number) => {
      const el = mainRef.current;
      if (!el) return;
      applyScroll(el.scrollLeft + delta);
    },
    [applyScroll],
  );

  const handleMainScroll = useCallback(() => {
    if (lockRef.current) return;
    const el = mainRef.current;
    if (!el) return;
    setScrollLeft(el.scrollLeft);
    setMaxScroll(Math.max(0, el.scrollWidth - el.clientWidth));
  }, []);

  const handleWheel = useCallback(
    (e: ReactWheelEvent<HTMLDivElement>) => {
      const el = mainRef.current;
      if (!el) return;

      const horizontalIntent =
        e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY);

      if (horizontalIntent) {
        e.preventDefault();
        applyScroll(el.scrollLeft + (e.deltaX || e.deltaY));
      }
    },
    [applyScroll],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;

      const target = e.target as HTMLElement;
      if (target.closest("button, a, input, select, textarea")) return;

      const el = mainRef.current;
      if (!el) return;

      dragRef.current = {
        active: true,
        startX: e.clientX,
        startScroll: el.scrollLeft,
      };

      el.setPointerCapture(e.pointerId);
      el.style.cursor = "grabbing";
    },
    [],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragRef.current.active) return;

      const delta = dragRef.current.startX - e.clientX;
      applyScroll(dragRef.current.startScroll + delta);
    },
    [applyScroll],
  );

  const endDrag = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;

    dragRef.current.active = false;
    const el = mainRef.current;
    if (!el) return;

    el.releasePointerCapture(e.pointerId);
    el.style.cursor = "";
  }, []);

  const scrollPercent = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0;

  return (
    <div className={`flex min-h-0 min-w-0 flex-1 flex-col ${className}`}>
      <div className="flex shrink-0 items-center gap-2 border-b border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-900">
        <button
          type="button"
          onClick={() => scrollBy(-CALENDAR_DAY_WIDTH * 2)}
          className="rounded-lg border border-gray-200 p-2 text-gray-700 transition hover:bg-white dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          aria-label="Rolar para a esquerda"
        >
          <ChevronLeft size={18} />
        </button>

        <input
          type="range"
          min={0}
          max={maxScroll}
          value={scrollLeft}
          onChange={(e) => applyScroll(Number(e.target.value))}
          className="calendar-scroll-slider min-w-0 flex-1 cursor-pointer"
          aria-label="Posição na timeline"
          style={{
            background: `linear-gradient(to right, rgb(37 99 235) ${scrollPercent}%, rgb(229 231 235) ${scrollPercent}%)`,
          }}
        />

        <button
          type="button"
          onClick={() => scrollBy(CALENDAR_DAY_WIDTH * 2)}
          className="rounded-lg border border-gray-200 p-2 text-gray-700 transition hover:bg-white dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          aria-label="Rolar para a direita"
        >
          <ChevronRight size={18} />
        </button>

        <span className="hidden text-[10px] text-gray-500 dark:text-gray-400 lg:inline">
          Arraste · Shift+scroll
        </span>
      </div>

      <div
        ref={mainRef}
        className="calendar-scroll-main min-h-0 flex-1 overflow-x-auto overflow-y-auto"
        onScroll={handleMainScroll}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onPointerCancel={endDrag}
      >
        {children}
      </div>
    </div>
  );
}
