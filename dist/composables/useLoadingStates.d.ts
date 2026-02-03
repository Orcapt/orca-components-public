import { type MaybeRef } from "vue";
/**
 * Composable for managing loading states
 * Optimized with computed properties and memoization
 */
export declare function useLoadingStates(description: MaybeRef<string>): {
    isLoading: import("vue").Ref<boolean, boolean>;
    isImageLoading: import("vue").Ref<boolean, boolean>;
    isVideoLoading: import("vue").Ref<boolean, boolean>;
    isCardLoading: import("vue").Ref<boolean, boolean>;
    isLocationLoading: import("vue").Ref<boolean, boolean>;
    getLoadingMessage: (loadingType: string) => string;
};
