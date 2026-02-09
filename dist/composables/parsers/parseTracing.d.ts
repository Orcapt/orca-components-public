import type { TracingData } from "../../types";
/**
 * Parse tracing data from YAML-like format
 *
 * @template
 * visibility: all
 * content: {"request_id": "req_123", "status": "success"}
 */
export declare function parseTracing(payload: string): TracingData;
