/**
 * Composable for managing image modal state
 * Provides clean API for opening/closing image modals
 */
export declare function useImageModal(): {
    modalVisible: import("vue").Ref<boolean, boolean>;
    currentImage: import("vue").Ref<string, string>;
    openModal: (imageUrl: string) => void;
    closeModal: () => void;
};
