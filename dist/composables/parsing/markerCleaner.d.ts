/**
 * Marker Cleaner Facade
 * Provides convenient API using pure functions from markerOperations
 */
/**
 * Remove only loading markers (preserves content between them)
 * Used when processing complete loading blocks
 */
export declare function removeOnlyLoadingMarkers(content: string): string;
/**
 * Remove complete markers (with both start and end)
 * Preserves incomplete loading markers (only start, no end)
 * Used for cleaning text before matches
 */
export declare function removeCompleteMarkers(content: string): string;
