import type { ContentPartType } from "../../types";
/**
 * Marker Types - Pure Data
 * No logic, just type definitions
 */
export type MarkerConfig = {
    type: ContentPartType;
    start: string;
    end: string;
};
/**
 * All marker definitions - Single Source of Truth
 * ONLY data, no functions
 */
export declare const MARKERS: MarkerConfig[];
/**
 * General loading type names - Derived from MARKERS
 * Single source of truth for general loading types
 */
export declare const GENERAL_LOADING_TYPES: readonly ["general-loading", "thinking-loading", "searching-loading", "coding-loading", "analyzing-loading", "generating-loading", "custom-loading"];
