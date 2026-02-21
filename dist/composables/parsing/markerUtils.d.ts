import type { ContentPartType } from "../../types";
import { type MarkerConfig } from "./markerDefinitions";
/**
 * Marker Utilities - Pure Functions
 * No side effects, stateless
 */
/**
 * Escape special regex characters
 */
export declare function escapeRegex(str: string): string;
/**
 * Create regex pattern from marker config
 */
export declare function createMarkerPattern(config: MarkerConfig): RegExp;
/**
 * Pattern definition for matching
 */
export type PatternDefinition = {
    type: ContentPartType;
    regex: RegExp;
};
/**
 * Generate patterns from markers
 */
export declare function generatePatterns(markers: MarkerConfig[]): PatternDefinition[];
/**
 * Auto-generated patterns from marker configs
 */
export declare const CONTENT_PATTERNS: PatternDefinition[];
/**
 * Filter markers by predicate
 */
export declare function filterMarkers(markers: MarkerConfig[], predicate: (marker: MarkerConfig) => boolean): MarkerConfig[];
/**
 * Get marker config by type
 */
export declare function getMarkerByType(markers: MarkerConfig[], type: ContentPartType): MarkerConfig | undefined;
/**
 * Check if type is loading type
 */
export declare function isLoadingType(type: ContentPartType): boolean;
/**
 * Check if type is general loading type
 * Uses the centralized list from markerDefinitions
 */
export declare function isGeneralLoadingType(type: ContentPartType): boolean;
/**
 * Get markers by category
 */
export declare function getMarkersByCategory(markers: MarkerConfig[], category: "loading" | "content"): MarkerConfig[];
/**
 * Get general loading markers
 */
export declare function getGeneralLoadingMarkers(markers: MarkerConfig[]): MarkerConfig[];
/**
 * Get content markers (non-loading)
 */
export declare function getContentMarkers(markers: MarkerConfig[]): MarkerConfig[];
