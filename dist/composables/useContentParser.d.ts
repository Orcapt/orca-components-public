import { type ComputedRef, type MaybeRef } from "vue";
import type { ContentPart } from "../types";
/**
 * Composable for parsing Orca content markers
 * Supports both reactive and non-reactive values for streaming compatibility
 */
export declare function useContentParser(description: MaybeRef<string>): ComputedRef<ContentPart[]>;
/**
 * Parse content into parts
 * Extracted for testability
 */
export declare function parseContent(content: string): ContentPart[];
