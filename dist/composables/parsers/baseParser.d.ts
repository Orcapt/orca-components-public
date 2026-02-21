/**
 * Base Parser Utilities
 * Common logic for all YAML-like parsers
 */
/**
 * Field definition for parsing
 */
export type FieldDef = {
    name: string;
    type?: "string" | "number";
    required?: boolean;
    defaultValue?: any;
};
/**
 * Parse YAML-like list format into array of objects
 *
 * @example
 * ```
 * - field1: value1
 *   field2: value2
 * - field1: value3  field2: value4
 * ```
 */
export declare function parseYamlList<T>(payload: string, fields: FieldDef[], mapper: (extracted: Record<string, any>) => T): T[];
/**
 * Parse simple key-value format
 *
 * @example
 * ```
 * key1: value1
 * key2: value2
 * ```
 */
export declare function parseKeyValue(payload: string, fields: string[]): Record<string, string>;
