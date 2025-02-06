import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteEvent as deleteEventApi } from '../../../entities/event/api';
import { useEditEventStore, useEventStore } from '../../../entities/event/model';

export const useMutationDeleteEvent = () => {
  const queryClient = useQueryClient();
  const { deleteEvent } = useEventStore();
  const { resetEditingEvent } = useEditEventStore();

  return useMutation({
    mutationFn: (id: string) => deleteEventApi(id),
    onMutate: (id) => {
      queryClient.setQueryData(['events'], () => deleteEvent(id));
    },
    onSuccess: async () => {
      resetEditingEvent();
      await queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: async (error) => {
      console.error('Error deleting event:', error);
      await queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};
