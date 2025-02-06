import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateEvent as updateEventApi } from '../../../entities/event/api';
import { Event, useEditEventStore, useEventStore } from '../../../entities/event/model';

export const useMutationUpdateEvent = () => {
  const queryClient = useQueryClient();
  const { updateEvent } = useEventStore();
  const { resetEditingEvent } = useEditEventStore();

  return useMutation({
    mutationFn: (newEvent: Event) => updateEventApi(newEvent),
    onMutate: (newEvent) => {
      queryClient.setQueryData(['events'], () => updateEvent(newEvent));
    },
    onSuccess: async () => {
      resetEditingEvent();
      await queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: async (error) => {
      console.error('Error updating event:', error);
      await queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};
