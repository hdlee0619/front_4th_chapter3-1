import {
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Select,
  Tooltip,
  useToast,
  VStack,
} from '@chakra-ui/react';

import {
  useEventStore,
  Event,
  EventForm as EventFormType,
  RepeatType,
  useOverlapEventStore,
  useEditEventStore,
} from '../../../entities/event/model';
import { useDialogStore } from '../../../features/@dialog/model';
import { useMutationAddEvent, useMutationUpdateEvent } from '../../../features/event/api';
import { useEventForm } from '../../../hooks/useEventForm.ts';
import { findOverlappingEvents } from '../../../utils/eventOverlap.ts';
import { getTimeErrorMessage } from '../../../utils/timeValidation.ts';

const categories = ['업무', '개인', '가족', '기타'];

const notificationOptions = [
  { value: 1, label: '1분 전' },
  { value: 10, label: '10분 전' },
  { value: 60, label: '1시간 전' },
  { value: 120, label: '2시간 전' },
  { value: 1440, label: '1일 전' },
];

export const EventForm = () => {
  const toast = useToast();
  const { setIsOverlapDialogOpen } = useDialogStore();
  const { events } = useEventStore();
  const { setOverlappingEvents } = useOverlapEventStore();
  const { setEditingEvent } = useEditEventStore();
  const {
    title,
    setTitle,
    date,
    setDate,
    startTime,
    endTime,
    description,
    setDescription,
    location,
    setLocation,
    category,
    setCategory,
    isRepeating,
    setIsRepeating,
    repeatType,
    setRepeatType,
    repeatInterval,
    setRepeatInterval,
    repeatEndDate,
    setRepeatEndDate,
    notificationTime,
    setNotificationTime,
    startTimeError,
    endTimeError,
    editingEventId,
    editingEvent,
    handleStartTimeChange,
    handleEndTimeChange,
  } = useEventForm();

  const { mutate: updateEvent } = useMutationUpdateEvent();
  const { mutate: addEvent } = useMutationAddEvent();

  const handleAddEvent = () => {
    if (!title || !date || !startTime || !endTime) {
      toast({
        title: '필수 정보를 모두 입력해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (startTimeError || endTimeError) {
      toast({
        title: '시간 설정을 확인해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const eventData: EventFormType = {
      title,
      date,
      startTime,
      endTime,
      description,
      location,
      category,
      repeat: {
        type: repeatType,
        interval: repeatInterval,
        endDate: repeatEndDate,
      },
      notificationTime,
    };

    const overlapping = findOverlappingEvents(eventData, events);

    if (overlapping.length > 0) {
      setEditingEvent(eventData);
      setOverlappingEvents(overlapping);
      setIsOverlapDialogOpen(true);
      return;
    } else {
      addEvent(eventData);
    }
  };

  const handleUpdateEvent = () => {
    if (!title || !date || !startTime || !endTime) {
      toast({
        title: '필수 정보를 모두 입력해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (startTimeError || endTimeError) {
      toast({
        title: '시간 설정을 확인해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const eventData: Event = {
      id: editingEventId,
      title,
      date,
      startTime,
      endTime,
      description,
      location,
      category,
      repeat: {
        type: repeatType,
        interval: repeatInterval,
        endDate: repeatEndDate,
      },
      notificationTime,
    };

    const overlapping = findOverlappingEvents(eventData, events);

    if (overlapping.length > 0) {
      setEditingEvent(eventData);
      setOverlappingEvents(overlapping);
      setIsOverlapDialogOpen(true);
      return;
    } else {
      updateEvent(eventData);
    }
  };

  return (
    <VStack w="400px" spacing={5} align="stretch">
      <Heading>{editingEvent ? '일정 수정' : '일정 추가'}</Heading>
      <FormControl>
        <FormLabel>제목</FormLabel>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </FormControl>
      <FormControl>
        <FormLabel>날짜</FormLabel>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </FormControl>
      <HStack width="100%">
        <FormControl>
          <FormLabel>시작 시간</FormLabel>
          <Tooltip label={startTimeError} isOpen={!!startTimeError} placement="top">
            <Input
              type="time"
              value={startTime}
              onChange={handleStartTimeChange}
              onBlur={() => getTimeErrorMessage(startTime, endTime)}
              isInvalid={!!startTimeError}
            />
          </Tooltip>
        </FormControl>
        <FormControl>
          <FormLabel>종료 시간</FormLabel>
          <Tooltip label={endTimeError} isOpen={!!endTimeError} placement="top">
            <Input
              type="time"
              value={endTime}
              onChange={handleEndTimeChange}
              onBlur={() => getTimeErrorMessage(startTime, endTime)}
              isInvalid={!!endTimeError}
            />
          </Tooltip>
        </FormControl>
      </HStack>
      <FormControl>
        <FormLabel>설명</FormLabel>
        <Input value={description} onChange={(e) => setDescription(e.target.value)} />
      </FormControl>
      <FormControl>
        <FormLabel>위치</FormLabel>
        <Input value={location} onChange={(e) => setLocation(e.target.value)} />
      </FormControl>
      <FormControl>
        <FormLabel>카테고리</FormLabel>
        <Select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">카테고리 선택</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </Select>
      </FormControl>
      <FormControl>
        <FormLabel>반복 설정</FormLabel>
        <Checkbox isChecked={isRepeating} onChange={(e) => setIsRepeating(e.target.checked)}>
          반복 일정
        </Checkbox>
      </FormControl>
      <FormControl>
        <FormLabel>알림 설정</FormLabel>
        <Select
          value={notificationTime}
          onChange={(e) => setNotificationTime(Number(e.target.value))}
        >
          {notificationOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </FormControl>
      {isRepeating && (
        <VStack width="100%">
          <FormControl>
            <FormLabel>반복 유형</FormLabel>
            <Select
              value={repeatType}
              onChange={(e) => setRepeatType(e.target.value as RepeatType)}
            >
              <option value="daily">매일</option>
              <option value="weekly">매주</option>
              <option value="monthly">매월</option>
              <option value="yearly">매년</option>
            </Select>
          </FormControl>
          <HStack width="100%">
            <FormControl>
              <FormLabel>반복 간격</FormLabel>
              <Input
                type="number"
                value={repeatInterval}
                onChange={(e) => setRepeatInterval(Number(e.target.value))}
                min={1}
              />
            </FormControl>
            <FormControl>
              <FormLabel>반복 종료일</FormLabel>
              <Input
                type="date"
                value={repeatEndDate}
                onChange={(e) => setRepeatEndDate(e.target.value)}
              />
            </FormControl>
          </HStack>
        </VStack>
      )}
      {editingEventId.length === 0 && (
        <Button data-testid="event-submit-button" onClick={handleAddEvent} colorScheme="blue">
          일정 추가
        </Button>
      )}
      {editingEventId.length !== 0 && (
        <Button data-testid="event-submit-button" onClick={handleUpdateEvent} colorScheme="blue">
          일정 수정
        </Button>
      )}
    </VStack>
  );
};
