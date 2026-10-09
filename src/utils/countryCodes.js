// International Country Calling Codes for Procurement & RFQ Contacts
export const COUNTRY_CODES = [
  { code: '+966', name: 'Saudi Arabia', flag: '🇸🇦', dial: '966', example: '5X XXX XXXX' },
  { code: '+971', name: 'United Arab Emirates', flag: '🇦🇪', dial: '971', example: '5X XXX XXXX' },
  { code: '+973', name: 'Bahrain', flag: '🇧🇭', dial: '973', example: '3X XXX XXX' },
  { code: '+965', name: 'Kuwait', flag: '🇰🇼', dial: '965', example: '9X XXX XXX' },
  { code: '+968', name: 'Oman', flag: '🇴🇲', dial: '968', example: '9X XXX XXX' },
  { code: '+974', name: 'Qatar', flag: '🇶🇦', dial: '974', example: '3X XXX XXX' },
  { code: '+20',  name: 'Egypt', flag: '🇪🇬', dial: '20', example: '1X XXXX XXXX' },
  { code: '+962', name: 'Jordan', flag: '🇯🇴', dial: '962', example: '7X XXX XXXX' },
  { code: '+92',  name: 'Pakistan', flag: '🇵🇰', dial: '92', example: '3XX XXXXXXX' },
  { code: '+91',  name: 'India', flag: '🇮🇳', dial: '91', example: '9XXXX XXXXX' },
  { code: '+44',  name: 'United Kingdom', flag: '🇬🇧', dial: '44', example: '7XXX XXXXXX' },
  { code: '+1',   name: 'United States / Canada', flag: '🇺🇸', dial: '1', example: '(XXX) XXX-XXXX' },
  { code: '+961', name: 'Lebanon', flag: '🇱🇧', dial: '961', example: '7X XXX XXX' },
  { code: '+964', name: 'Iraq', flag: '🇮🇶', dial: '964', example: '7XX XXX XXXX' },
  { code: '+90',  name: 'Turkey', flag: '🇹🇷', dial: '90', example: '5XX XXX XXXX' },
  { code: '+880', name: 'Bangladesh', flag: '🇧🇩', dial: '880', example: '1XXX XXXXXX' },
  { code: '+63',  name: 'Philippines', flag: '🇵🇭', dial: '63', example: '9XX XXX XXXX' },
  { code: '+49',  name: 'Germany', flag: '🇩🇪', dial: '49', example: '1XX XXXXXXXX' },
  { code: '+33',  name: 'France', flag: '🇫🇷', dial: '33', example: '6 XX XX XX XX' },
  { code: '+39',  name: 'Italy', flag: '🇮🇹', dial: '39', example: '3XX XXXXXXX' },
  { code: '+86',  name: 'China', flag: '🇨🇳', dial: '86', example: '1XX XXXX XXXX' },
  { code: '+81',  name: 'Japan', flag: '🇯🇵', dial: '81', example: '90 XXXX XXXX' },
  { code: '+82',  name: 'South Korea', flag: '🇰🇷', dial: '82', example: '10 XXXX XXXX' },
  { code: '+65',  name: 'Singapore', flag: '🇸🇬', dial: '65', example: '9XXX XXXX' },
  { code: '+60',  name: 'Malaysia', flag: '🇲🇾', dial: '60', example: '1X XXX XXXX' },
  { code: '+61',  name: 'Australia', flag: '🇦🇺', dial: '61', example: '4XX XXX XXX' }
];

export const DEFAULT_COUNTRY_CODE = '+966';

/**
 * Clean and format phone number with country code
 * @param {string} countryCode e.g. "+966"
 * @param {string} localNumber e.g. "0534017242" or "534017242"
 * @returns {string} e.g. "+966 53 401 7242"
 */
export function formatFullPhoneNumber(countryCode, localNumber) {
  if (!localNumber || !localNumber.trim()) return '';
  const raw = localNumber.trim();
  
  // If user already typed leading + or complete code, respect it
  if (raw.startsWith('+')) {
    return raw;
  }
  
  // Strip leading 0 often typed locally in Saudi / GCC (e.g. "053" -> "53")
  const stripped = raw.replace(/^0+/, '');
  return `${countryCode || '+966'} ${stripped}`;
}
