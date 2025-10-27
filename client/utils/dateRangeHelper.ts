/**
 * Helper function to calculate default date range based on current date
 * Matches the backend logic for automatic date range selection
 */
export function getDefaultDateRange(): { startDate: Date; endDate: Date } {
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  let startDay: number;
  let endDay: number;
  
  if (currentDay >= 1 && currentDay <= 10) {
    // 1st to 10th of the month
    startDay = 1;
    endDay = 10;
  } else if (currentDay >= 11 && currentDay <= 20) {
    // 11th to 20th of the month
    startDay = 11;
    endDay = 20;
  } else {
    // 21st to end of month
    startDay = 21;
    // Get last day of the month
    endDay = new Date(currentYear, currentMonth + 1, 0).getDate();
  }
  
  const startDate = new Date(currentYear, currentMonth, startDay);
  const endDate = new Date(currentYear, currentMonth, endDay);
  
  return {
    startDate,
    endDate
  };
}

