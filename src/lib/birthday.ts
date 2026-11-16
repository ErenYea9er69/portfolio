export const BIRTH_DATE_ISO = "2004-09-16T16:00:00";
export const BIRTH_TIMESTAMP = new Date(BIRTH_DATE_ISO).getTime();
export const BIRTHDAY_MONTH = 8;
export const BIRTHDAY_DAY = 16;

const MS_PER_YEAR = 1000 * 60 * 60 * 24 * 365.2425;

export function isBirthdayToday(now = new Date()): boolean {
  return now.getMonth() === BIRTHDAY_MONTH && now.getDate() === BIRTHDAY_DAY;
}

export function calculateAgeYears(now = Date.now()): string {
  const ageInYears = (now - BIRTH_TIMESTAMP) / MS_PER_YEAR;
  return ageInYears.toFixed(2);
}

export function calculateUptime(now = new Date()): string {
  const diffMs = now.getTime() - BIRTH_TIMESTAMP;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const years = Math.floor(diffDays / 365.25);
  const remainingDays = Math.floor(diffDays % 365.25);
  return `${years} years, ${remainingDays} days`;
}
