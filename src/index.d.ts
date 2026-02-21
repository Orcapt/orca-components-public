/**
 * Type definitions for @orcapt/orca-components
 */

import { DefineComponent } from "vue";

export interface OrcaMarkdownProps {
  /** محتوای اصلی با marker های orca */
  description: string;
  /** نقش پیام */
  role: "assistant" | "user";
  /** آیا آخرین پیام است؟ */
  isLastMessage?: boolean;
  /** فایل‌های پیوست شده */
  fileAttachments?: any[];
  /** نمایش برای */
  visibility?: "all" | "user" | "bot";
  /** Agent ID */
  agentId?: string;
  /** Message ID */
  messageId?: string;
}

export interface OrcaMarkdownEmits {
  (e: "send-message", data: any): void;
}

export const OrcaMarkdown: DefineComponent<OrcaMarkdownProps, {}, any>;

export function cleanOrcaMarkers(text: string): string;
export function hasLoadingMarkers(text: string): boolean;
