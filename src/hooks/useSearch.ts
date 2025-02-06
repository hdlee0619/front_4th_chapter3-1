import { useMemo, useState } from 'react';

import { useEventStore } from '../entities/event/model';
import { useCalendarStore } from '../features/calendar';
import { getFilteredEvents } from '../utils/eventUtils';

export const useSearch = () => {
  const { events } = useEventStore();
  const { view, currentDate } = useCalendarStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEvents = useMemo(() => {
    return getFilteredEvents(events, searchTerm, currentDate, view);
  }, [events, searchTerm, currentDate, view]);

  return {
    searchTerm,
    setSearchTerm,
    filteredEvents,
  };
};
