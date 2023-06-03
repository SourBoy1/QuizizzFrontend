export const GDPRCountry = (requestCountryCode) => {
  if (!requestCountryCode) { return false; }

  const country = requestCountryCode.toUpperCase();

  switch (country) {
    // EU member countries
    case 'AT': // Austria
    case 'BE': // Belgium
    case 'BG': // Bulgaria
    case 'HR': // Croatia
    case 'CY': // Cyprus
    case 'CZ': // Czech Republic
    case 'DK': // Denmark
    case 'EE': // Estonia
    case 'FI': // Finland
    case 'FR': // France
    case 'DE': // Germany
    case 'GR': // Greece
    case 'HU': // Hungary
    case 'IE': // Ireland
    case 'IT': // Italy
    case 'LV': // Latvia
    case 'LT': // Lithuania
    case 'LU': // Luxembourg
    case 'MT': // Malta
    case 'NL': // Netherlands
    case 'PL': // Poland
    case 'PT': // Portugal
    case 'RO': // Romania
    case 'SK': // Slovakia
    case 'SI': // Slovenia
    case 'ES': // Spain
    case 'SE': // Sweden
    case 'GB': // United Kingdom
    case 'IS': // Iceland
    case 'LI': // Liechtenstein
    case 'NO': // Norway
      return true;

    default:
      return false;
  }
};
