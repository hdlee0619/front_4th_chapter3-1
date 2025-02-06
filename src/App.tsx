import { Alert, AlertIcon, AlertTitle, Box, CloseButton, Flex, VStack } from '@chakra-ui/react';

import { OverlapDialog } from './features/@dialog/ui';
import { useNotifications } from './hooks/useNotifications.ts';
import { useSearch } from './hooks/useSearch.ts';
import { Calendar } from './widgets/calendar/ui';
import { EventForm, EventList } from './widgets/event/ui';

function App() {
  const { notifications, notifiedEvents, setNotifications } = useNotifications();
  const { filteredEvents } = useSearch();

  return (
    <Box w="full" h="100vh" m="auto" p={5}>
      <Flex gap={6} h="full">
        <EventForm />

        <Calendar {...{ filteredEvents, notifiedEvents }} />

        <EventList />
      </Flex>

      <OverlapDialog />

      {notifications.length > 0 && (
        <VStack position="fixed" top={4} right={4} spacing={2} align="flex-end">
          {notifications.map((notification, index) => (
            <Alert key={index} status="info" variant="solid" width="auto">
              <AlertIcon />
              <Box flex="1">
                <AlertTitle fontSize="sm">{notification.message}</AlertTitle>
              </Box>
              <CloseButton
                onClick={() => setNotifications((prev) => prev.filter((_, i) => i !== index))}
              />
            </Alert>
          ))}
        </VStack>
      )}
    </Box>
  );
}

export default App;
