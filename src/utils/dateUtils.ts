export function generateDateRange(startDate: Date, days: number): Date[] {
  const dates: Date[] = [];
  // Create a proper date copy to avoid mutation
  const currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  
  for (let i = 0; i < days; i++) {
    dates.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
}

export function getDateRangeFromDays(days: number): { from: Date; to: Date } {
  const today = new Date();
  // Reset time to start of day to avoid timezone issues
  const from = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const to = new Date(today.getFullYear(), today.getMonth(), today.getDate() + days - 1);
  
  return { from, to };
}

export function getDaysBetweenDates(startDate: Date, endDate: Date): number {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}