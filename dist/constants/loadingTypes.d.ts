/**
 * Loading content part types that should be filtered out
 * These are handled separately in the loading indicators section
 */
export declare const LOADING_CONTENT_TYPES: readonly ["general-loading", "thinking-loading", "searching-loading", "coding-loading", "analyzing-loading", "generating-loading", "custom-loading", "image-loading", "video-loading", "youtube-loading", "card-loading", "map-loading"];
/**
 * Type guard to check if a content part is a loading type
 */
export declare function isLoadingType(type: string): type is (typeof LOADING_CONTENT_TYPES)[number];
