import type { LocationData } from "../../types";
/**
 * Parse location data from comma-separated coordinates
 *
 * @template
 * 35.6892, 51.3890
 *
 * @example
 * "35.6892, 51.3890" -> { latitude: 35.6892, longitude: 51.3890 }
 */
export declare function parseLocation(payload: string): LocationData;
