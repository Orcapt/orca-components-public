import { type Ref } from "vue";
/**
 * Composable for managing code block copy/collapse buttons
 * Optimized with debouncing and efficient DOM manipulation
 */
export declare function useCodeButtons(containerRef: Ref<HTMLElement | null>, shouldAddButtons: () => boolean): {
    addCodeButtons: () => void;
};
