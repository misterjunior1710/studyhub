import { useState, useEffect } from "react";

// Maps IP geolocation country codes to our COUNTRIES list
const COUNTRY_CODE_MAP: Record<string, string> = {
  US: "United States",
  GB: "United Kingdom",
  IN: "India",
  CA: "Canada",
  AU: "Australia",
  DE: "Germany",
  FR: "France",
  ES: "Spain",
  IT: "Italy",
  NL: "Netherlands",
  SE: "Sweden",
  PL: "Poland",
  CH: "Switzerland",
  BE: "Belgium",
  AT: "Austria",
};

export const useCountryDetect = () => {
  const [detectedCountry, setDetectedCountry] = useState<string>("");
  const [isDetecting, setIsDetecting] = useState(true);

  useEffect(() => {
    const detect = async () => {
      try {
        // Use free IP geolocation APIs with fallback
        const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(5000) });
        if (!res.ok) throw new Error("ipapi failed");
        const data = await res.json();
        const code = data.country_code;
        setDetectedCountry(COUNTRY_CODE_MAP[code] || "Other");
      } catch {
        try {
          const res = await fetch("https://ip2c.org/self", { signal: AbortSignal.timeout(5000) });
          const text = await res.text();
          // Format: "1;XX;XXX;Country Name"
          const parts = text.split(";");
          if (parts[0] === "1" && parts[1]) {
            setDetectedCountry(COUNTRY_CODE_MAP[parts[1]] || "Other");
          }
        } catch {
          // Silent fail — user picks manually
        }
      } finally {
        setIsDetecting(false);
      }
    };

    detect();
  }, []);

  return { detectedCountry, isDetecting };
};
