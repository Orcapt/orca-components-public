import type { ContentPart, ContentPartType } from "../../types";
/**
 * Process match and return content part
 *
 * @param type - Content type to process
 * @param payload - Content payload
 * @returns ContentPart or null for loading types
 */
export declare function processMatch(type: ContentPartType, payload: string): ContentPart | null;
