import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { Heading, HStack, IconButton, Select, VStack } from '@chakra-ui/react';

import { MonthView, WeekView } from '../../../entities/calendar/ui';
import { Event } from '../../../entities/event/model';
import { useCalendarStore } from '../../../features/calendar';

interface Props {
  filteredEvents: Event[];
  notifiedEvents: string[];
}

export const Calendar = ({ filteredEvents, notifiedEvents }: Props) => {
  const { view, setView, navigate } = useCalendarStore();

  return (
    <VStack flex={1} spacing={5} align="stretch">
      <Heading>일정 보기</Heading>

      <HStack mx="auto" justifyContent="space-between">
        <IconButton
          aria-label="Previous"
          icon={<ChevronLeftIcon />}
          onClick={() => navigate('prev')}
        />
        <Select
          aria-label="view"
          value={view}
          onChange={(e) => setView(e.target.value as 'week' | 'month')}
        >
          <option value="week">Week</option>
          <option value="month">Month</option>
        </Select>
        <IconButton
          aria-label="Next"
          icon={<ChevronRightIcon />}
          onClick={() => navigate('next')}
        />
      </HStack>

      {view === 'week' && <WeekView {...{ filteredEvents, notifiedEvents }} />}
      {view === 'month' && <MonthView {...{ filteredEvents, notifiedEvents }} />}
    </VStack>
  );
};
