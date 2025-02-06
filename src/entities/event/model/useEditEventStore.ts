import { create } from 'zustand/react';

import { Event, EventForm } from './Event.ts';

type State = {
  editingEventId: string;
  editingEvent: EventForm | Event | null;
};

type Action = {
  setEditingEventId: (id: string) => void;
  setEditingEvent: (editingEvent: Event | EventForm | null) => void;
  resetEditingEvent: () => void;
};

export const useEditEventStore = create<State & Action>((set) => ({
  editingEventId: '',
  editingEvent: {
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  },
  setEditingEventId: (id) => set({ editingEventId: id }),
  setEditingEvent: (editingEvent) => set({ editingEvent }),
  resetEditingEvent: () =>
    set({
      editingEventId: '',
      editingEvent: {
        title: '',
        date: '',
        startTime: '',
        endTime: '',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
    }),
}));
