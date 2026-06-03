/**
 * Calculates birth date from the 14-digit Egyptian National ID.
 * The National ID format is:
 * - Digit 1: Century (2 for 1900-1999, 3 for 2000-2099)
 * - Digits 2-3: Year of birth
 * - Digits 4-5: Month of birth
 * - Digits 6-7: Day of birth
 * 
 * @param {string} nationalId - The 14-digit Egyptian National ID
 * @returns {string} The birth date in YYYY-MM-DD format, or empty string if invalid.
 */
export function calculateBirthDateFromNationalId(nationalId) {
  if (!nationalId) return '';
  const cleanId = String(nationalId).trim();
  if (cleanId.length !== 14 || !/^\d{14}$/.test(cleanId)) {
    return '';
  }

  const centuryDigit = cleanId.charAt(0);
  const year = cleanId.substring(1, 3);
  const month = cleanId.substring(3, 5);
  const day = cleanId.substring(5, 7);

  let century = '';
  if (centuryDigit === '2') {
    century = '19';
  } else if (centuryDigit === '3') {
    century = '20';
  } else {
    return '';
  }

  const fullYear = parseInt(century + year, 10);
  const monthInt = parseInt(month, 10);
  const dayInt = parseInt(day, 10);

  if (monthInt < 1 || monthInt > 12) return '';
  if (dayInt < 1 || dayInt > 31) return '';

  // Return formatted as YYYY-MM-DD
  return `${fullYear}-${month}-${day}`;
}
