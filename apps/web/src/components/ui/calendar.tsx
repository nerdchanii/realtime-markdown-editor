import { DayPicker, type DayPickerProps } from "react-day-picker";

import { cn } from "@/lib/utils.js";

export type CalendarProps = DayPickerProps;

export function Calendar({ className, classNames, ...props }: CalendarProps) {
  return (
    <DayPicker
      className={cn("ui-calendar", className)}
      classNames={{
        month: "ui-calendar__month",
        month_caption: "ui-calendar__caption",
        caption_label: "ui-calendar__caption-label",
        nav: "ui-calendar__nav",
        button_previous: "ui-calendar__nav-button",
        button_next: "ui-calendar__nav-button",
        weekdays: "ui-calendar__weekdays",
        weekday: "ui-calendar__weekday",
        week: "ui-calendar__week",
        day: "ui-calendar__day",
        day_button: "ui-calendar__day-button",
        selected: "ui-calendar__day--selected",
        today: "ui-calendar__day--today",
        outside: "ui-calendar__day--outside",
        disabled: "ui-calendar__day--disabled",
        ...classNames,
      }}
      {...props}
    />
  );
}
