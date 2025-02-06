import { create } from 'zustand/react';

type State = {
  view: 'week' | 'month';
  currentDate: Date;
  holidays: { [key: string]: string };
};

type Action = {
  setView: (view: 'week' | 'month') => void;
  setCurrentDate: (date: Date) => void;
  setHolidays: (holidays: { [key: string]: string }) => void;
  navigate: (direction: 'prev' | 'next') => void;
  reset: () => void;
};

export const useCalendarStore = create<State & Action>((set) => ({
  view: 'month',
  currentDate: new Date(),
  holidays: {},
  setView: (view) => set({ view }),
  setCurrentDate: (currentDate) => set({ currentDate }),
  setHolidays: (holidays) => set({ holidays }),
  navigate: (direction) =>
    set((state) => {
      const newDate = new Date(state.currentDate);
      if (state.view === 'week') {
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
      } else if (state.view === 'month') {
        newDate.setDate(1);
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
      }
      return { currentDate: newDate };
    }),
  reset: () => set({ view: 'month', currentDate: new Date(), holidays: {} }),
}));
