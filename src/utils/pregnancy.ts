export interface PregnancyProgress {
  weeks: number;
  days: number;
  totalDays: number;
  daysRemaining: number;
  percentage: number;
  trimester: 1 | 2 | 3;
}

export function calculatePregnancyProgress(dueDateStr?: string): PregnancyProgress {
  if (!dueDateStr) {
    // Default fallback to 24 weeks if no due date set yet
    return {
      weeks: 24,
      days: 2,
      totalDays: 170,
      daysRemaining: 110,
      percentage: 60,
      trimester: 2,
    };
  }

  const dueDate = new Date(dueDateStr);
  const now = new Date();

  // If invalid date string, return default
  if (isNaN(dueDate.getTime())) {
    return {
      weeks: 24,
      days: 0,
      totalDays: 168,
      daysRemaining: 112,
      percentage: 60,
      trimester: 2,
    };
  }

  // Estimated conception was 280 days before due date
  const conceptionDate = new Date(dueDate.getTime() - 280 * 24 * 60 * 60 * 1000);
  const elapsedMs = now.getTime() - conceptionDate.getTime();
  const elapsedDays = Math.max(0, Math.floor(elapsedMs / (24 * 60 * 60 * 1000)));

  const remainingMs = dueDate.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));

  const weeks = Math.min(42, Math.floor(elapsedDays / 7));
  const days = elapsedDays % 7;
  const percentage = Math.min(100, Math.max(0, Math.round((elapsedDays / 280) * 100)));

  let trimester: 1 | 2 | 3 = 1;
  if (weeks >= 28) {
    trimester = 3;
  } else if (weeks >= 13) {
    trimester = 2;
  }

  return {
    weeks: Math.max(1, weeks),
    days,
    totalDays: elapsedDays,
    daysRemaining,
    percentage,
    trimester,
  };
}

/**
 * Calculates estimated due date if mother knows only her current pregnancy week (1 to 40)
 */
export function calculateDueDateFromCurrentWeek(currentWeek: number): string {
  const boundedWeek = Math.min(40, Math.max(1, currentWeek));
  const remainingWeeks = 40 - boundedWeek;
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + remainingWeeks * 7);
  return targetDate.toISOString().split('T')[0];
}

export function formatDateFriendly(isoString?: string): string {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
