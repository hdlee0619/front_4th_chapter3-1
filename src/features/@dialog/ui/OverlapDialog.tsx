import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Text,
} from '@chakra-ui/react';
import { useRef } from 'react';

import {
  Event,
  EventForm,
  useEditEventStore,
  useOverlapEventStore,
} from '../../../entities/event/model';
import { useMutationAddEvent, useMutationUpdateEvent } from '../../event/api';
import { useDialogStore } from '../model';

export const OverlapDialog = () => {
  const { isOverlapDialogOpen, setIsOverlapDialogOpen } = useDialogStore();
  const { overlappingEvents } = useOverlapEventStore();
  const { editingEventId, editingEvent } = useEditEventStore();
  const cancelRef = useRef<HTMLButtonElement>(null);

  const { mutate: mutateAddEvent } = useMutationAddEvent();
  const { mutate: mutateUpdateEvent } = useMutationUpdateEvent();

  const handleEventSave = () => {
    setIsOverlapDialogOpen(false);
    if (editingEventId.length === 0) {
      const newEvent = { ...editingEvent } as EventForm;
      mutateAddEvent(newEvent);
    } else {
      const updateEvent = { id: editingEventId, ...editingEvent } as Event;
      mutateUpdateEvent(updateEvent);
    }
  };

  return (
    <AlertDialog
      isOpen={isOverlapDialogOpen}
      leastDestructiveRef={cancelRef}
      onClose={() => setIsOverlapDialogOpen(false)}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            일정 겹침 경고
          </AlertDialogHeader>

          <AlertDialogBody>
            다음 일정과 겹칩니다:
            {overlappingEvents.map((event) => (
              <Text key={event.id}>
                {event.title} ({event.date} {event.startTime}-{event.endTime})
              </Text>
            ))}
            계속 진행하시겠습니까?
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={() => setIsOverlapDialogOpen(false)}>
              취소
            </Button>
            <Button colorScheme="red" onClick={handleEventSave} ml={3}>
              계속 진행
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};
