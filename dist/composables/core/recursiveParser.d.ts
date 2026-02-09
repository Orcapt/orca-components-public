import type { ContentPart } from "../../types";
/**
 * Parse content recursively to extract all parts
 * Used when extracting content from inside loading markers
 */
export declare function parseContentRecursively(content: string): ContentPart[];
