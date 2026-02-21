import type { ButtonData } from "../types";
/**
 * Utility functions for Orca Components
 */
/**
 * بررسی اینکه آیا URL یک فایل تصویری است یا خیر
 */
export declare function isImageFile(url: string): boolean;
/**
 * استخراج نام فایل از URL
 */
export declare function getFileNameFromUrl(url: string): string | null;
/**
 * استخراج YouTube ID از URL
 */
export declare function getYouTubeId(url: string): string;
/**
 * تبدیل نام رنگ Vuetify
 */
export declare function getVuetifyColor(colorName?: string): string;
/**
 * گروه‌بندی دکمه‌ها بر اساس ردیف
 */
export declare function getGroupedButtons(buttons: ButtonData[]): ButtonData[][];
/**
 * تولید ID یکتا برای container نقشه
 */
export declare function generateMapId(index: number): string;
/**
 * پاک کردن marker های orca از متن
 */
export declare function cleanOrcaMarkers(text: string): string;
/**
 * بررسی اینکه آیا محتوا loading marker دارد یا خیر
 */
export declare function hasLoadingMarkers(content: string): boolean;
/**
 * استخراج style برای دکمه‌های outlined
 */
export declare function getOutlinedButtonStyle(color?: string): Record<string, string>;
/**
 * استخراج style برای متن دکمه‌های outlined
 */
export declare function getOutlinedButtonTextStyle(color?: string): Record<string, string>;
/**
 * استخراج style برای آیکون append
 */
export declare function getAppendIconStyle(color?: string): Record<string, string>;
