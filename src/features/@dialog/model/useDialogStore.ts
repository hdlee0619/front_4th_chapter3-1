import { create } from 'zustand/react';

type State = {
  isOverlapDialogOpen: boolean;
};

type Action = {
  setIsOverlapDialogOpen: (isOpen: boolean) => void;
};

export const useDialogStore = create<State & Action>((set) => ({
  isOverlapDialogOpen: false,
  setIsOverlapDialogOpen: (isOpen) => set({ isOverlapDialogOpen: isOpen }),
  reset: () => set({ isOverlapDialogOpen: false }),
}));
