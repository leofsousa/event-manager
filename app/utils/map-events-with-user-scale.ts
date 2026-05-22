import type { Event } from "@/types/type-event";

const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const calcArrival = (startTime: string) => {
  const [h, m] = startTime.split(":").map(Number);
  const arrival = new Date();
  arrival.setHours(h - 1, m, 0);
  return arrival.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function mapEventsWithUserScale(
  rawEvents: Record<string, unknown>[],
  userId: string,
): Event[] {
  return rawEvents.map((event) => {
    const shifts = (event.event_shifts as Record<string, unknown>[]) ?? [];
    const hasScale = shifts.length > 0;

    const userShift =
      shifts.find((shift) =>
        (
          shift.event_shift_collaborators as { collaborator_id: string }[]
        )?.some((c) => c.collaborator_id === userId),
      ) ?? null;

    const isUserScaled = !!userShift;

    let arrivalTime: string | null = null;
    let isFirstShift = false;

    const shiftStart = userShift?.start_time as string | undefined;

    if (shiftStart) {
      const earliestShift = [...shifts].sort(
        (a, b) =>
          toMinutes(a.start_time as string) - toMinutes(b.start_time as string),
      )[0];

      isFirstShift = earliestShift?.id === userShift?.id;

      if (isFirstShift) {
        arrivalTime = calcArrival(shiftStart);
      }
    }

    const channels = event.channels as { sigla: string } | null | undefined;

    return {
      ...(event as Event),
      channel:
        channels ??
        (event.channel as Event["channel"]) ??
        null,
      hasScale,
      isUserScaled,
      userShift: userShift
        ? {
            id: userShift.id as string,
            start_time: userShift.start_time as string,
            end_time: userShift.end_time as string,
          }
        : null,
      arrivalTime,
      isFirstShift,
    };
  });
}
