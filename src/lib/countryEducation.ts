// Maps countries to the education streams/curricula relevant to them
// Students will see their country's streams first, then "Other" for everything else

export const COUNTRY_STREAMS: Record<string, string[]> = {
  "India": ["CBSE", "IGCSE", "IB", "State Board", "Cambridge", "Other"],
  "United States": ["AP", "IB", "Cambridge", "Other"],
  "United Kingdom": ["GCSE", "A-Levels", "IB", "IGCSE", "Cambridge", "Edexcel", "Other"],
  "Canada": ["AP", "IB", "Cambridge", "Other"],
  "Australia": ["IB", "Cambridge", "IGCSE", "Other"],
  "Germany": ["German Abitur", "IB", "IGCSE", "Cambridge", "Other"],
  "France": ["French Baccalauréat", "IB", "IGCSE", "Cambridge", "Other"],
  "Netherlands": ["Dutch VWO", "IB", "IGCSE", "Cambridge", "Other"],
  "Spain": ["IB", "IGCSE", "Cambridge", "Other"],
  "Italy": ["IB", "IGCSE", "Cambridge", "Other"],
  "Sweden": ["IB", "IGCSE", "Cambridge", "Other"],
  "Poland": ["IB", "IGCSE", "Cambridge", "Other"],
  "Switzerland": ["IB", "IGCSE", "Cambridge", "French Baccalauréat", "German Abitur", "Other"],
  "Belgium": ["IB", "IGCSE", "Cambridge", "French Baccalauréat", "Dutch VWO", "Other"],
  "Austria": ["German Abitur", "IB", "IGCSE", "Cambridge", "Other"],
};

// Fallback for "Other" country or unmapped countries
export const DEFAULT_STREAMS = [
  "CBSE", "IGCSE", "IB", "AP", "A-Levels", "GCSE",
  "State Board", "Cambridge", "Edexcel", "German Abitur",
  "French Baccalauréat", "Dutch VWO", "Other"
];

/**
 * Returns relevant streams for a country. Falls back to all streams for unknown countries.
 */
export const getStreamsForCountry = (country: string): string[] => {
  return COUNTRY_STREAMS[country] || DEFAULT_STREAMS;
};
