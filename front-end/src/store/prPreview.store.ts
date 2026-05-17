import { create } from "zustand";

export interface ChangedFiles {
  owner: string;
  repo: string;
  prNumber: number;
  files: {
    filename: string;
    status: string;
    patch: string | undefined;
    sha: string;
    additions: number;
    deletions: number;
  }[];
}

interface PrPreviewStore {
  url: string | null;
  setUrl: (url: string) => void;
  prPreview: ChangedFiles | null;
  setPrPreview: (prPreview: ChangedFiles | null) => void;
  isPrPreviewLoading: boolean;
  setIsPrPreviewLoading: (isLoading: boolean) => void;
}

export const usePrPreviewStore = create<PrPreviewStore>((set) => ({
  url: null,
  setUrl: (url) => set({ url }),
  prPreview: null,
  setPrPreview: (prPreview) => set({ prPreview }),
  isPrPreviewLoading: false,
  setIsPrPreviewLoading: (isPrPreviewLoading) => set({ isPrPreviewLoading }),
}));
