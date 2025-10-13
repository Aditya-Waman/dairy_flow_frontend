import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled = false,
  className,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-11 px-4 py-2.5 bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200",
            !value && "text-gray-500",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-3 h-4 w-4 text-gray-400" />
          {value ? format(value, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 shadow-xl border-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

interface DateRangePickerProps {
  startDate?: Date;
  endDate?: Date;
  onStartDateChange?: (date: Date | undefined) => void;
  onEndDateChange?: (date: Date | undefined) => void;
  startPlaceholder?: string;
  endPlaceholder?: string;
  disabled?: boolean;
  className?: string;
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  startPlaceholder = "Start date",
  endPlaceholder = "End date",
  disabled = false,
  className,
}: DateRangePickerProps) {
  return (
    <div className={cn("flex gap-3", className)}>
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Start Date
        </label>
        <DatePicker
          value={startDate}
          onChange={onStartDateChange}
          placeholder={startPlaceholder}
          disabled={disabled}
        />
      </div>
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          End Date
        </label>
        <DatePicker
          value={endDate}
          onChange={onEndDateChange}
          placeholder={endPlaceholder}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
