import { useQuery } from '@tanstack/react-query';

import { fetchEvents } from '../../../entities/event/api';

export const useQueryEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: () => fetchEvents(),
  });
};
