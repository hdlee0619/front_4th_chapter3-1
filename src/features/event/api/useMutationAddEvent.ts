import { useMutation, useQueryClient } from '@tanstack/react-query';

import { addEvent as addEventApi, EventsResponse } from '../../../entities/event/api';
import { EventForm, useEditEventStore, useEventStore } from '../../../entities/event/model';

export const useMutationAddEvent = () => {
  const queryClient = useQueryClient();
  const { addEvent } = useEventStore();
  const { resetEditingEvent } = useEditEventStore();

  return useMutation({
    mutationFn: (newEvent: EventForm) => addEventApi(newEvent),
    onMutate: async (newEvent) => {
      await queryClient.cancelQueries({ queryKey: ['events'] });

      const tempId = Math.floor(Math.random() * 1000000).toString();
      const optimisticEvent = { id: tempId, ...newEvent };

      queryClient.setQueryData(['events'], (oldEvents: EventsResponse) => {
        console.log('old Events', oldEvents);
        return {
          events: [...oldEvents.events, optimisticEvent],
        };
      });

      addEvent(optimisticEvent);

      await queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onSuccess: async () => {
      resetEditingEvent();
      await queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: async (error) => {
      console.error('Error adding event:', error);
      await queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};
