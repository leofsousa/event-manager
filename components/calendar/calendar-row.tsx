"use client";

import { ReactNode } from "react";

type Props = {
  title: string;
  days: Date[];
  dayWidth: number;
  children: (dateKey: string) => ReactNode;
};

const formatDateKey = (date: Date) => {
  return date.toISOString().split("T")[0];
};

export default function CalendarRow({
  title,
  days,
  dayWidth,
  children,
}: Props) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-800">
      {/* TÍTULO */}
      <div
        className="
          sticky left-0 z-10
          border-b border-gray-200
          bg-gray-50 px-4 py-2
          dark:border-gray-800
          dark:bg-gray-900
        "
      >
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          {title}
        </h3>
      </div>

      {/* GRID */}
      <div className="flex">
        {days.map((day) => {
          const dateKey = formatDateKey(day);

          return (
            <div
              key={dateKey}
              className="
                min-h-[160px]
                border-r border-gray-200
                p-2
                dark:border-gray-800
              "
              style={{
                width: `${dayWidth}px`,
                minWidth: `${dayWidth}px`,
              }}
            >
              {children(dateKey)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
