import { useEffect } from 'react';

import { useCalendarStore } from '../../../features/calendar';
import { fetchHolidays } from '../api';

export const useCalendarView = () => {
  const { view, setView, currentDate, setCurrentDate, holidays, setHolidays, navigate } =
    useCalendarStore();

  useEffect(() => {
    setHolidays(fetchHolidays(currentDate));
  }, [currentDate]);

  return { view, setView, currentDate, setCurrentDate, holidays, navigate };
};
