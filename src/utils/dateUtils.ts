export function generateDateRange(startDate: Date, days: number): Date[] {
  const dates: Date[] = [];
  const currentDate = new Date(startDate);
  
  for (let i = 0; i < days; i++) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
}

export function getDateRangeFromDays(days: number): { from: Date; to: Date } {
  const from = new Date();
  const to = new Date();
  to.setDate(to.getDate() + days - 1);
  
  return { from, to };
}

export function getDaysBetweenDates(startDate: Date, endDate: Date): number {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}