/**
 * Utility functions for date comparison and formatting.
 */

/**
 * Checks if a given due date string corresponds to today's date in the user's local timezone.
 * Handles diverse formats such as:
 * - "22 August 2026", "22 Aug 2026", "August 22, 2026", "Aug 22"
 * - "2026-08-22", "2026/08/22"
 * - "2026-08-22T00:00:00Z", "2026-08-22T18:30:00Z"
 * - "22/08/2026", "08/22/2026", "22-08-2026"
 * - "Today", "today", "Today, 2:00 PM"
 * - Ignores "Tomorrow", "Yesterday", non-matching dates
 */
export function isDueToday(dueDateStr?: string | null, referenceDate: Date = new Date()): boolean {
  if (!dueDateStr || typeof dueDateStr !== 'string') return false;
  const raw = dueDateStr.trim();
  if (!raw) return false;

  const lower = raw.toLowerCase();
  if (
    lower === 'today' ||
    lower.startsWith('today,') ||
    lower.startsWith('today ') ||
    lower.startsWith('due today')
  ) {
    return true;
  }
  if (
    lower === 'tomorrow' ||
    lower === 'yesterday' ||
    lower.startsWith('tomorrow') ||
    lower.startsWith('yesterday')
  ) {
    return false;
  }

  const targetYear = referenceDate.getFullYear();
  const targetMonth = referenceDate.getMonth(); // 0-indexed: 0 = Jan, 7 = Aug
  const targetDay = referenceDate.getDate();

  // 1. Check ISO / Standard date formats: YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = raw.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (isoMatch) {
    const y = parseInt(isoMatch[1], 10);
    const m = parseInt(isoMatch[2], 10) - 1;
    const d = parseInt(isoMatch[3], 10);
    if (y === targetYear && m === targetMonth && d === targetDay) {
      return true;
    }
  }

  // 2. Check DD/MM/YYYY or MM/DD/YYYY numeric formats
  const dmyMatch = raw.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmyMatch) {
    const num1 = parseInt(dmyMatch[1], 10);
    const num2 = parseInt(dmyMatch[2], 10);
    const y = parseInt(dmyMatch[3], 10);
    if (y === targetYear) {
      // If num1 is day and num2 is month (DD/MM/YYYY)
      if (num1 === targetDay && num2 - 1 === targetMonth) return true;
      // If num1 is month and num2 is day (MM/DD/YYYY)
      if (num1 - 1 === targetMonth && num2 === targetDay) return true;
    }
  }

  // 3. Named Month Formats (e.g., "22 August 2026", "22 Aug 2026", "August 22, 2026", "Aug 22", "Nov 05")
  const monthMap: Record<string, number> = {
    january: 0, jan: 0,
    february: 1, feb: 1,
    march: 2, mar: 2,
    april: 3, apr: 3,
    may: 4,
    june: 5, jun: 5,
    july: 6, jul: 6,
    august: 7, aug: 7,
    september: 8, sep: 8, sept: 8,
    october: 9, oct: 9,
    november: 10, nov: 10,
    december: 11, dec: 11,
  };

  for (const [mName, mIndex] of Object.entries(monthMap)) {
    const mRegex = new RegExp(`\\b${mName}\\b`, 'i');
    if (mRegex.test(raw)) {
      const numbers = raw.match(/\d+/g)?.map((n) => parseInt(n, 10)) || [];
      let parsedYear = targetYear;
      let parsedDay: number | null = null;

      for (const num of numbers) {
        if (num >= 1900 && num <= 2100) {
          parsedYear = num;
        } else if (num >= 1 && num <= 31 && parsedDay === null) {
          parsedDay = num;
        }
      }

      if (parsedDay !== null) {
        if (parsedYear === targetYear && mIndex === targetMonth && parsedDay === targetDay) {
          return true;
        }
        return false;
      }
    }
  }

  // 4. Try JS standard Date parsing for ISO timestamp strings (e.g. 2026-08-22T18:30:00Z)
  const parsed = new Date(raw);
  if (!isNaN(parsed.getTime())) {
    // Check local date parts
    const localMatch =
      parsed.getFullYear() === targetYear &&
      parsed.getMonth() === targetMonth &&
      parsed.getDate() === targetDay;

    // Check UTC date parts (prevents timezone boundary offset issues on UTC-midnight dates)
    const utcMatch =
      parsed.getUTCFullYear() === targetYear &&
      parsed.getUTCMonth() === targetMonth &&
      parsed.getUTCDate() === targetDay;

    if (localMatch || utcMatch) {
      return true;
    }
  }

  return false;
}
