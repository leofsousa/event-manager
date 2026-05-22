"use client";

import { ReactNode } from "react";

export const CALENDAR_ROW_LABEL_WIDTH = 132;

type Props = {
  title: string;
  days: Date[];
  dayWidth: number;
  highlighted?: boolean;
  rowMinHeight?: number;
  children: (dateKey: string) => ReactNode;
};

const formatDateKey = (date: Date) => {
  return date.toISOString().split("T")[0];
};

export default function CalendarRow({
  title,
  days,
  dayWidth,
  highlighted = false,
  rowMinHeight = 160,
  children,
}: Props) {
  const labelBg = highlighted
    ? "bg-blue-100 dark:bg-blue-950"
    : "bg-gray-50 dark:bg-gray-900";

  const rowBg = highlighted
    ? "bg-blue-50/70 dark:bg-blue-950/25"
    : "";

  return (
    <div
      className={`
        border-b border-gray-200 dark:border-gray-800
        ${highlighted ? "ring-2 ring-inset ring-blue-400/60 dark:ring-blue-600/50" : ""}
        ${rowBg}
      `}
    >
      <div className="flex">
        <div
          className={`
            sticky left-0 z-20 flex shrink-0 items-center
            border-r border-gray-200 px-3 py-3
            dark:border-gray-800
            ${labelBg}
          `}
          style={{
            width: `${CALENDAR_ROW_LABEL_WIDTH}px`,
            minWidth: `${CALENDAR_ROW_LABEL_WIDTH}px`,
            minHeight: `${rowMinHeight}px`,
          }}
        >
          <div className="flex flex-col gap-1">
            {highlighted && (
              <span className="w-fit rounded-full bg-blue-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                Sua escala
              </span>
            )}
            <h3
              className={`text-sm font-semibold ${
                highlighted
                  ? "text-blue-800 dark:text-blue-200"
                  : "text-gray-700 dark:text-gray-200"
              }`}
            >
              {title}
            </h3>
          </div>
        </div>

        <div className="flex">
          {days.map((day) => {
            const dateKey = formatDateKey(day);

            return (
              <div
                key={dateKey}
                className={`
                  border-r border-gray-200 p-2 dark:border-gray-800
                  ${highlighted ? "bg-blue-50/40 dark:bg-blue-950/15" : ""}
                `}
                style={{
                  width: `${dayWidth}px`,
                  minWidth: `${dayWidth}px`,
                  minHeight: `${rowMinHeight}px`,
                }}
              >
                {children(dateKey)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
