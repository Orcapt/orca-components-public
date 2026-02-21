import type { ContentPartType } from "../../types";
export type MatchCandidate = {
    type: ContentPartType;
    match: RegExpMatchArray | null;
    index: number;
};
export type ValidMatch = MatchCandidate & {
    match: RegExpMatchArray;
};
/**
 * Find all matches in content
 */
export declare function findMatches(content: string): ValidMatch[];
