import { create } from 'zustand/react';

import { Event, EventForm } from './Event.ts';

type State = {
  editingEvent: EventForm | Event;
  overlappingEvents: Event[];
};

type Action = {
  setEditingEvent: (event: EventForm | Event) => void;
  setOverlappingEvents: (events: Event[]) => void;
  reset: () => void;
};

export const useOverlapEventStore = create<State & Action>((set) => ({
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
  overlappingEvents: [],
  setEditingEvent: (event) => set({ editingEvent: event }),
  setOverlappingEvents: (events) => set({ overlappingEvents: events }),
  reset: () => {
    set({
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
      overlappingEvents: [],
    });
  },
}));
