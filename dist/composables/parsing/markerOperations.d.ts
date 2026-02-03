/**
 * Marker Cleaner - Pure Operations
 * All functions are pure, stateless, and composable
 */
import type { MarkerConfig } from "./markerDefinitions";
/**
 * Remove markers from content
 * @param content - Content to clean
 * @param markers - Markers to remove
 * @param preserveContent - Keep content between markers or remove entirely
 */
export declare function removeMarkers(content: string, markers: MarkerConfig[], preserveContent?: boolean): string;
/**
 * Remove only loading markers (preserves content between them)
 */
export declare function removeLoadingMarkers(content: string, loadingMarkers: MarkerConfig[]): string;
/**
 * Remove content markers (removes everything)
 */
export declare function removeContentMarkers(content: string, contentMarkers: MarkerConfig[]): string;
/**
 * Remove all markers with different strategies
 * @param content - Content to clean
 * @param loadingMarkers - Loading markers (preserve content)
 * @param contentMarkers - Content markers (remove everything)
 */
export declare function removeAllMarkers(content: string, loadingMarkers: MarkerConfig[], contentMarkers: MarkerConfig[]): string;
