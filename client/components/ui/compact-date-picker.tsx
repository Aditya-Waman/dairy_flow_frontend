import * as React from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface CompactDatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showDayName?: boolean;
}

const MiniCalendar = ({ value, onChange }: { value?: Date; onChange?: (date: Date) => void }) => {
  const [currentDate, setCurrentDate] = React.useState(value || new Date());
  const selectedDate = value || new Date();

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: Array<{ day: number; isCurrentMonth: boolean; date: Date }> = [];
    
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthLastDay - i)
      });
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i)
      });
    }
    
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i)
      });
    }
    
    return days;
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return isSameDay(date, today);
  };

  const handleDateClick = (date: Date) => {
    onChange?.(date);
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-1.5 w-52">
      <div className="flex items-center justify-between mb-1.5 px-1">
        <button
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
          className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          type="button"
        >
          <ChevronLeft className="w-3 h-3 text-gray-600 dark:text-gray-400" />
        </button>
        
        <h2 className="text-xs font-semibold text-primary">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        
        <button
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
          className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          type="button"
        >
          <ChevronRight className="w-3 h-3 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px mb-1">
        {daysOfWeek.map((day, i) => (
          <div key={i} className="text-center text-[9px] font-semibold text-gray-600 dark:text-gray-400">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px">
        {days.map((dayObj, index) => {
          const isSelected = isSameDay(dayObj.date, selectedDate);
          const isTodayDate = isToday(dayObj.date);
          
          return (
            <button
              key={index}
              onClick={() => handleDateClick(dayObj.date)}
              type="button"
              className={cn(
                "w-6 h-6 flex items-center justify-center text-[10px] rounded-full transition-all",
                !dayObj.isCurrentMonth && "text-gray-300 dark:text-gray-600",
                dayObj.isCurrentMonth && "text-gray-900 dark:text-gray-100",
                isSelected && "bg-primary text-primary-foreground font-semibold",
                !isSelected && "hover:bg-gray-100 dark:hover:bg-gray-700",
                isTodayDate && !isSelected && "bg-gray-200 dark:bg-gray-700 font-semibold"
              )}
            >
              {dayObj.day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export function CompactDatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled = false,
  className,
}: CompactDatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-9 px-3 justify-start text-left font-normal text-xs",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-3 w-3" />
          {value ? format(value, "dd MMM yy") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <MiniCalendar value={value} onChange={onChange} />
      </PopoverContent>
    </Popover>
  );
}

interface CompactDateRangePickerProps {
  startDate?: Date;
  endDate?: Date;
  onStartDateChange?: (date: Date | undefined) => void;
  onEndDateChange?: (date: Date | undefined) => void;
  startPlaceholder?: string;
  endPlaceholder?: string;
  disabled?: boolean;
  className?: string;
  showDayName?: boolean;
}

export function CompactDateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  startPlaceholder = "From",
  endPlaceholder = "To",
  disabled = false,
  className,
}: CompactDateRangePickerProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <CompactDatePicker
        value={startDate}
        onChange={onStartDateChange}
        placeholder={startPlaceholder}
        disabled={disabled}
        className="flex-1"
      />
      <span className="text-xs text-muted-foreground">→</span>
      <CompactDatePicker
        value={endDate}
        onChange={onEndDateChange}
        placeholder={endPlaceholder}
        disabled={disabled}
        className="flex-1"
      />
    </div>
  );
}
