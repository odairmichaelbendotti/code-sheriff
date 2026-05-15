import { create } from "zustand";

export interface Pull {
  id: number;
  number: number;
  title: string;
  html_url: string;
  repository_url: string;
  state: string;
  created_at: string;
  updated_at: string;
  draft: boolean;
  user: {
    login: string | undefined;
    avatar_url: string | undefined;
  };
}

interface PullsStore {
  pulls: Pull[] | null;
  setPulls: (pulls: Pull[]) => void;
  isFetching: boolean;
  setIsFetching: (isFetching: boolean) => void;
}

export const usePullsStore = create<PullsStore>((set) => ({
  pulls: [],
  setPulls: (pulls) => set({ pulls }),
  isFetching: false,
  setIsFetching: (isFetching) => set({ isFetching }),
}));
