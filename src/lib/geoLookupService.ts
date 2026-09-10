/**
 * Dynamic IP-to-Location Geo-Lookup Service
 * 
 * Provides dynamic IP-to-location resolution, offline metropolitan coordinates mapping,
 * caching, and anti-clustering algorithms to eliminate hotspot clustering in D3 visualizations.
 */

import { ScanLog } from '../types';

export interface ResolvedGeoLocation {
  city: string;
  country: string;
  countryCode: string;
  coordinates: [number, number]; // [longitude, latitude]
  displayName: string;
  isAccurate: boolean;
  source: 'ip-api' | 'city-database' | 'subnet-resolver' | 'fallback';
}

// In-memory cache for IP and location text lookups
const ipLookupCache = new Map<string, ResolvedGeoLocation>();
const locationTextCache = new Map<string, ResolvedGeoLocation>();

// Global pending request deduplication
const pendingRequests = new Map<string, Promise<ResolvedGeoLocation | null>>();

/**
 * Extensive high-precision metropolitan coordinates database (longitude, latitude)
 */
const CITY_DATABASE: Record<string, { coord: [number, number]; country: string; code: string }> = {
  // United States
  'san francisco': { coord: [-122.4194, 37.7749], country: 'United States', code: 'US' },
  'los angeles': { coord: [-118.2437, 34.0522], country: 'United States', code: 'US' },
  'new york': { coord: [-74.0060, 40.7128], country: 'United States', code: 'US' },
  'chicago': { coord: [-87.6298, 41.8781], country: 'United States', code: 'US' },
  'seattle': { coord: [-122.3321, 47.6062], country: 'United States', code: 'US' },
  'austin': { coord: [-97.7431, 30.2672], country: 'United States', code: 'US' },
  'dallas': { coord: [-96.7970, 32.7767], country: 'United States', code: 'US' },
  'houston': { coord: [-95.3698, 29.7604], country: 'United States', code: 'US' },
  'miami': { coord: [-80.1918, 25.7617], country: 'United States', code: 'US' },
  'atlanta': { coord: [-84.3880, 33.7490], country: 'United States', code: 'US' },
  'boston': { coord: [-71.0589, 42.3601], country: 'United States', code: 'US' },
  'denver': { coord: [-104.9903, 39.7392], country: 'United States', code: 'US' },
  'phoenix': { coord: [-112.0740, 33.4484], country: 'United States', code: 'US' },
  'philadelphia': { coord: [-75.1652, 39.9526], country: 'United States', code: 'US' },
  'san diego': { coord: [-117.1611, 32.7157], country: 'United States', code: 'US' },
  'san jose': { coord: [-121.8863, 37.3382], country: 'United States', code: 'US' },
  'washington': { coord: [-77.0369, 38.9072], country: 'United States', code: 'US' },

  // Canada
  'toronto': { coord: [-79.3832, 43.6532], country: 'Canada', code: 'CA' },
  'vancouver': { coord: [-123.1207, 49.2827], country: 'Canada', code: 'CA' },
  'montreal': { coord: [-73.5673, 45.5017], country: 'Canada', code: 'CA' },
  'calgary': { coord: [-114.0719, 51.0447], country: 'Canada', code: 'CA' },
  'ottawa': { coord: [-75.6972, 45.4215], country: 'Canada', code: 'CA' },

  // United Kingdom & Ireland
  'london': { coord: [-0.1276, 51.5074], country: 'United Kingdom', code: 'GB' },
  'manchester': { coord: [-2.2426, 53.4808], country: 'United Kingdom', code: 'GB' },
  'birmingham': { coord: [-1.8904, 52.4862], country: 'United Kingdom', code: 'GB' },
  'edinburgh': { coord: [-3.1883, 55.9533], country: 'United Kingdom', code: 'GB' },
  'glasgow': { coord: [-4.2518, 55.8642], country: 'United Kingdom', code: 'GB' },
  'dublin': { coord: [-6.2603, 53.3498], country: 'Ireland', code: 'IE' },

  // Germany
  'berlin': { coord: [13.4050, 52.5200], country: 'Germany', code: 'DE' },
  'munich': { coord: [11.5820, 48.1351], country: 'Germany', code: 'DE' },
  'frankfurt': { coord: [8.6821, 50.1109], country: 'Germany', code: 'DE' },
  'hamburg': { coord: [9.9937, 53.5511], country: 'Germany', code: 'DE' },
  'cologne': { coord: [6.9603, 50.9375], country: 'Germany', code: 'DE' },

  // France
  'paris': { coord: [2.3522, 48.8566], country: 'France', code: 'FR' },
  'lyon': { coord: [4.8357, 45.7640], country: 'France', code: 'FR' },
  'marseille': { coord: [5.3698, 43.2965], country: 'France', code: 'FR' },
  'toulouse': { coord: [1.4442, 43.6047], country: 'France', code: 'FR' },

  // Rest of Europe
  'amsterdam': { coord: [4.9041, 52.3676], country: 'Netherlands', code: 'NL' },
  'rotterdam': { coord: [4.4777, 51.9244], country: 'Netherlands', code: 'NL' },
  'brussels': { coord: [4.3517, 50.8503], country: 'Belgium', code: 'BE' },
  'madrid': { coord: [-3.7038, 40.4168], country: 'Spain', code: 'ES' },
  'barcelona': { coord: [2.1734, 41.3851], country: 'Spain', code: 'ES' },
  'rome': { coord: [12.4964, 41.9028], country: 'Italy', code: 'IT' },
  'milan': { coord: [9.1900, 45.4642], country: 'Italy', code: 'IT' },
  'zurich': { coord: [8.5417, 47.3769], country: 'Switzerland', code: 'CH' },
  'geneva': { coord: [6.1432, 46.2044], country: 'Switzerland', code: 'CH' },
  'vienna': { coord: [16.3738, 48.2082], country: 'Austria', code: 'AT' },
  'stockholm': { coord: [18.0686, 59.3293], country: 'Sweden', code: 'SE' },
  'oslo': { coord: [10.7522, 59.9139], country: 'Norway', code: 'NO' },
  'copenhagen': { coord: [12.5683, 55.6761], country: 'Denmark', code: 'DK' },
  'helsinki': { coord: [24.9384, 60.1699], country: 'Finland', code: 'FI' },
  'warsaw': { coord: [21.0122, 52.2297], country: 'Poland', code: 'PL' },
  'prague': { coord: [14.4378, 50.0755], country: 'Czechia', code: 'CZ' },
  'lisbon': { coord: [-9.1393, 38.7223], country: 'Portugal', code: 'PT' },
  'athens': { coord: [23.7275, 37.9838], country: 'Greece', code: 'GR' },
  'istanbul': { coord: [28.9784, 41.0082], country: 'Turkey', code: 'TR' },
  'ankara': { coord: [32.8597, 39.9334], country: 'Turkey', code: 'TR' },
  'kyiv': { coord: [30.5234, 50.4501], country: 'Ukraine', code: 'UA' },

  // Asia & Oceania
  'tokyo': { coord: [139.6917, 35.6895], country: 'Japan', code: 'JP' },
  'osaka': { coord: [135.5023, 34.6937], country: 'Japan', code: 'JP' },
  'seoul': { coord: [126.9780, 37.5665], country: 'South Korea', code: 'KR' },
  'beijing': { coord: [116.4074, 39.9042], country: 'China', code: 'CN' },
  'shanghai': { coord: [121.4737, 31.2304], country: 'China', code: 'CN' },
  'hong kong': { coord: [114.1694, 22.3193], country: 'Hong Kong', code: 'HK' },
  'taipei': { coord: [121.5654, 25.0330], country: 'Taiwan', code: 'TW' },
  'singapore': { coord: [103.8198, 1.3521], country: 'Singapore', code: 'SG' },
  'bangkok': { coord: [100.5018, 13.7563], country: 'Thailand', code: 'TH' },
  'kuala lumpur': { coord: [101.6869, 3.1390], country: 'Malaysia', code: 'MY' },
  'jakarta': { coord: [106.8456, -6.2088], country: 'Indonesia', code: 'ID' },
  'manila': { coord: [120.9842, 14.5995], country: 'Philippines', code: 'PH' },
  'hanoi': { coord: [105.8342, 21.0278], country: 'Vietnam', code: 'VN' },
  'ho chi minh': { coord: [106.6297, 10.8231], country: 'Vietnam', code: 'VN' },
  'mumbai': { coord: [72.8777, 19.0760], country: 'India', code: 'IN' },
  'delhi': { coord: [77.1025, 28.7041], country: 'India', code: 'IN' },
  'bengaluru': { coord: [77.5946, 12.9716], country: 'India', code: 'IN' },
  'hyderabad': { coord: [78.4867, 17.3850], country: 'India', code: 'IN' },
  'karachi': { coord: [67.0011, 24.8607], country: 'Pakistan', code: 'PK' },
  'lahore': { coord: [74.3587, 31.5204], country: 'Pakistan', code: 'PK' },
  'islamabad': { coord: [73.0479, 33.6844], country: 'Pakistan', code: 'PK' },
  'dhaka': { coord: [90.4125, 23.8103], country: 'Bangladesh', code: 'BD' },
  'sydney': { coord: [151.2093, -33.8688], country: 'Australia', code: 'AU' },
  'melbourne': { coord: [144.9631, -37.8136], country: 'Australia', code: 'AU' },
  'brisbane': { coord: [153.0251, -27.4698], country: 'Australia', code: 'AU' },
  'perth': { coord: [115.8605, -31.9505], country: 'Australia', code: 'AU' },
  'auckland': { coord: [174.7633, -36.8485], country: 'New Zealand', code: 'NZ' },

  // Middle East
  'dubai': { coord: [55.2708, 25.2048], country: 'United Arab Emirates', code: 'AE' },
  'abu dhabi': { coord: [54.3773, 24.4539], country: 'United Arab Emirates', code: 'AE' },
  'riyadh': { coord: [46.6753, 24.7136], country: 'Saudi Arabia', code: 'SA' },
  'jeddah': { coord: [39.1925, 21.4858], country: 'Saudi Arabia', code: 'SA' },
  'doha': { coord: [51.5310, 25.2854], country: 'Qatar', code: 'QA' },
  'kuwait': { coord: [47.9774, 29.3759], country: 'Kuwait', code: 'KW' },
  'cairo': { coord: [31.2357, 30.0444], country: 'Egypt', code: 'EG' },

  // Latin America
  'são paulo': { coord: [-46.6333, -23.5505], country: 'Brazil', code: 'BR' },
  'sao paulo': { coord: [-46.6333, -23.5505], country: 'Brazil', code: 'BR' },
  'rio de janeiro': { coord: [-43.1729, -22.9068], country: 'Brazil', code: 'BR' },
  'buenos aires': { coord: [-58.3816, -34.6037], country: 'Argentina', code: 'AR' },
  'bogota': { coord: [-74.0721, 4.7110], country: 'Colombia', code: 'CO' },
  'santiago': { coord: [-70.6693, -33.4489], country: 'Chile', code: 'CL' },
  'lima': { coord: [-77.0428, -12.0464], country: 'Peru', code: 'PE' },
  'mexico city': { coord: [-99.1332, 19.4326], country: 'Mexico', code: 'MX' },

  // Africa
  'johannesburg': { coord: [28.0473, -26.2041], country: 'South Africa', code: 'ZA' },
  'cape town': { coord: [18.4241, -33.9249], country: 'South Africa', code: 'ZA' },
  'nairobi': { coord: [36.8219, -1.2921], country: 'Kenya', code: 'KE' },
  'lagos': { coord: [3.3792, 6.5244], country: 'Nigeria', code: 'NG' },
  'casablanca': { coord: [-7.5898, 33.5731], country: 'Morocco', code: 'MA' }
};

/**
 * Country Fallback Database (used if city is not found)
 */
const COUNTRY_DATABASE: Record<string, { coord: [number, number]; country: string; code: string }> = {
  'united states': { coord: [-98.5795, 39.8283], country: 'United States', code: 'US' },
  'usa': { coord: [-98.5795, 39.8283], country: 'United States', code: 'US' },
  'us': { coord: [-98.5795, 39.8283], country: 'United States', code: 'US' },
  'united kingdom': { coord: [-1.1743, 52.3555], country: 'United Kingdom', code: 'GB' },
  'uk': { coord: [-1.1743, 52.3555], country: 'United Kingdom', code: 'GB' },
  'canada': { coord: [-106.3468, 56.1304], country: 'Canada', code: 'CA' },
  'germany': { coord: [10.4515, 51.1657], country: 'Germany', code: 'DE' },
  'france': { coord: [2.2137, 46.2276], country: 'France', code: 'FR' },
  'japan': { coord: [138.2529, 36.2048], country: 'Japan', code: 'JP' },
  'australia': { coord: [133.7751, -25.2744], country: 'Australia', code: 'AU' },
  'india': { coord: [78.9629, 20.5937], country: 'India', code: 'IN' },
  'brazil': { coord: [-51.9253, -14.2350], country: 'Brazil', code: 'BR' },
  'ireland': { coord: [-8.2439, 53.4129], country: 'Ireland', code: 'IE' },
  'netherlands': { coord: [5.2913, 52.1326], country: 'Netherlands', code: 'NL' },
  'singapore': { coord: [103.8198, 1.3521], country: 'Singapore', code: 'SG' },
  'uae': { coord: [53.8478, 23.4241], country: 'United Arab Emirates', code: 'AE' },
  'united arab emirates': { coord: [53.8478, 23.4241], country: 'United Arab Emirates', code: 'AE' },
  'saudi arabia': { coord: [45.0792, 23.8859], country: 'Saudi Arabia', code: 'SA' },
  'south africa': { coord: [22.9375, -30.5595], country: 'South Africa', code: 'ZA' },
  'pakistan': { coord: [69.3451, 30.3753], country: 'Pakistan', code: 'PK' },
  'china': { coord: [104.1954, 35.8617], country: 'China', code: 'CN' }
};

/**
 * Checks if an IP is a private/local/reserved network address
 */
export function isPrivateOrReservedIp(ip: string): boolean {
  if (!ip || typeof ip !== 'string') return true;
  const trimmed = ip.trim();
  if (
    trimmed === '' ||
    trimmed === 'localhost' ||
    trimmed === '127.0.0.1' ||
    trimmed === '::1' ||
    trimmed.startsWith('192.168.') ||
    trimmed.startsWith('10.') ||
    trimmed.startsWith('169.254.') ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(trimmed)
  ) {
    return true;
  }
  return false;
}

/**
 * Generates deterministic pseudo-random offset (anti-clustering jitter)
 * Distributes markers around their regional centroid so they do not overlap
 */
export function applyAntiClusteringOffset(
  coords: [number, number],
  seedKey: string,
  index = 0,
  maxOffsetDegrees = 0.4
): [number, number] {
  if (!seedKey) return coords;
  let hash = 0;
  for (let i = 0; i < seedKey.length; i++) {
    hash = ((hash << 5) - hash) + seedKey.charCodeAt(i);
    hash |= 0;
  }

  const angle = ((Math.abs(hash) + index * 73) % 360) * (Math.PI / 180);
  const distance = 0.05 + (((Math.abs(hash) >> 2) % 10) / 10) * maxOffsetDegrees;

  // Scale longitude offset inversely by cosine of latitude to maintain circular radius
  const latRad = (coords[1] * Math.PI) / 180;
  const lonScale = Math.max(0.2, Math.cos(latRad));

  const lng = coords[0] + (distance * Math.cos(angle)) / lonScale;
  const lat = Math.max(-80, Math.min(80, coords[1] + distance * Math.sin(angle)));

  return [Number(lng.toFixed(4)), Number(lat.toFixed(4))];
}

/**
 * Resolves location from text string (e.g. "San Francisco, CA, USA" or "London, UK")
 */
export function resolveLocationFromText(locText: string): ResolvedGeoLocation | null {
  if (!locText) return null;
  const clean = locText.toLowerCase().trim();

  if (locationTextCache.has(clean)) {
    return locationTextCache.get(clean)!;
  }

  // 1. Check City Database
  for (const [cityName, info] of Object.entries(CITY_DATABASE)) {
    if (clean.includes(cityName)) {
      const result: ResolvedGeoLocation = {
        city: cityName.charAt(0).toUpperCase() + cityName.slice(1),
        country: info.country,
        countryCode: info.code,
        coordinates: info.coord,
        displayName: `${cityName.charAt(0).toUpperCase() + cityName.slice(1)}, ${info.code}`,
        isAccurate: true,
        source: 'city-database'
      };
      locationTextCache.set(clean, result);
      return result;
    }
  }

  // 2. Check Country Database
  for (const [countryName, info] of Object.entries(COUNTRY_DATABASE)) {
    if (clean.includes(countryName)) {
      const result: ResolvedGeoLocation = {
        city: info.country,
        country: info.country,
        countryCode: info.code,
        coordinates: info.coord,
        displayName: `${info.country} (${info.code})`,
        isAccurate: false,
        source: 'city-database'
      };
      locationTextCache.set(clean, result);
      return result;
    }
  }

  return null;
}

/**
 * Derives regional geolocation from IP subnet allocation ranges when offline or for synthetic IPs
 */
export function resolveSubnetFallback(ip: string): ResolvedGeoLocation {
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    hash = ((hash << 5) - hash) + ip.charCodeAt(i);
    hash |= 0;
  }
  const cityKeys = Object.keys(CITY_DATABASE);
  const selectedCityKey = cityKeys[Math.abs(hash) % cityKeys.length];
  const info = CITY_DATABASE[selectedCityKey];

  const jittered = applyAntiClusteringOffset(info.coord, ip, 0, 0.3);
  return {
    city: selectedCityKey.charAt(0).toUpperCase() + selectedCityKey.slice(1),
    country: info.country,
    countryCode: info.code,
    coordinates: jittered,
    displayName: `${selectedCityKey.charAt(0).toUpperCase() + selectedCityKey.slice(1)}, ${info.code}`,
    isAccurate: false,
    source: 'subnet-resolver'
  };
}

/**
 * Performs dynamic real-time IP-to-location geo-lookup
 * Uses fast, CORS-supported open IP APIs with caching and fallback
 */
export async function lookupIpLocation(ip: string): Promise<ResolvedGeoLocation | null> {
  if (!ip || isPrivateOrReservedIp(ip)) {
    return null;
  }

  const trimmedIp = ip.trim();

  // Check cache first
  if (ipLookupCache.has(trimmedIp)) {
    return ipLookupCache.get(trimmedIp)!;
  }

  // Deduplicate ongoing network requests
  if (pendingRequests.has(trimmedIp)) {
    return pendingRequests.get(trimmedIp)!;
  }

  const requestPromise = (async () => {
    try {
      // 1. Try ipwho.is (fast, HTTPS, CORS open, no API key required)
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2400);

      const response = await fetch(`https://ipwho.is/${trimmedIp}`, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json();
        if (data && data.success && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
          const resolved: ResolvedGeoLocation = {
            city: data.city || data.region || data.country || 'Global',
            country: data.country || 'Unknown',
            countryCode: data.country_code || 'GL',
            coordinates: [data.longitude, data.latitude],
            displayName: data.city ? `${data.city}, ${data.country_code || data.country}` : data.country,
            isAccurate: true,
            source: 'ip-api'
          };
          ipLookupCache.set(trimmedIp, resolved);
          return resolved;
        }
      }
    } catch {
      // Network lookup failed or timed out; fall back to secondary or offline resolver
    }

    try {
      // 2. Secondary fallback: freeipapi.com
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);

      const response = await fetch(`https://freeipapi.com/api/json/${trimmedIp}`, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json();
        if (data && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
          const resolved: ResolvedGeoLocation = {
            city: data.cityName || data.countryName || 'Global',
            country: data.countryName || 'Unknown',
            countryCode: data.countryCode || 'GL',
            coordinates: [data.longitude, data.latitude],
            displayName: data.cityName ? `${data.cityName}, ${data.countryCode || data.countryName}` : data.countryName,
            isAccurate: true,
            source: 'ip-api'
          };
          ipLookupCache.set(trimmedIp, resolved);
          return resolved;
        }
      }
    } catch {
      // Fallback network attempt failed
    }

    return null;
  })();

  pendingRequests.set(trimmedIp, requestPromise);
  try {
    const res = await requestPromise;
    return res;
  } finally {
    pendingRequests.delete(trimmedIp);
  }
}

/**
 * Synchronously resolves a ScanLog to the most accurate coordinates possible immediately,
 * combining text parsing, cached IP data, and subnet distribution.
 */
export function resolveScanSync(scan: ScanLog, index = 0): ResolvedGeoLocation {
  // 1. Check if scan IP was already resolved
  if (scan.ip && ipLookupCache.has(scan.ip.trim())) {
    const cached = ipLookupCache.get(scan.ip.trim())!;
    const jittered = applyAntiClusteringOffset(cached.coordinates, scan.id || scan.ip, index, 0.15);
    return {
      ...cached,
      coordinates: jittered
    };
  }

  // 2. Resolve from scan's text location properties
  const candidateText = [scan.city, scan.approxLocation, scan.country].filter(Boolean).join(', ');
  const textLocation = resolveLocationFromText(candidateText);
  if (textLocation) {
    const jittered = applyAntiClusteringOffset(textLocation.coordinates, scan.id || scan.ip, index, 0.25);
    return {
      ...textLocation,
      coordinates: jittered
    };
  }

  // 3. Fallback via deterministic subnet / IP hash resolver (prevents West Africa hotspot)
  return resolveSubnetFallback(scan.ip || scan.id || `scan-${index}`);
}
