import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect } from 'vitest';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event, EventForm } from '../../types.ts';

const mockEvents = [
  {
    id: '1',
    title: '취업박람회',
    date: '2024-10-01',
    startTime: '10:00',
    endTime: '17:00',
    description: '취업박람회 참가',
    location: '강남',
    category: '취업',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '데이트',
    date: '2024-10-16',
    startTime: '10:00',
    endTime: '17:00',
    description: '데이트 하기',
    location: '송파',
    category: '데이트',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
] as Event[];

const mockToast = vi.fn();
vi.mock('@chakra-ui/react', () => ({
  useToast: () => mockToast,
}));

describe('이벤트 CRUD 테스트 >', () => {
  beforeEach(() => {
    mockToast.mockClear();
  });

  it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
    setupMockHandlerCreation(mockEvents);

    const { result } = renderHook(() => useEventOperations(false));

    await act(async () => {
      await result.current.fetchEvents();
    });

    expect(result.current.events).toEqual(mockEvents);
  });

  it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
    setupMockHandlerCreation(mockEvents);

    const { result } = renderHook(() => useEventOperations(false));

    await act(async () => {
      await result.current.fetchEvents();
    });

    const newEvent = {
      title: '새로운 이벤트',
      date: '2024-10-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '새로운 이벤트 설명',
      location: '강남',
      category: '기타',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    } as EventForm;

    await act(async () => {
      await result.current.saveEvent(newEvent);
    });

    expect(result.current.events).toEqual([...mockEvents, { id: '3', ...newEvent }]);
  });

  it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
    setupMockHandlerUpdating(mockEvents);

    const { result } = renderHook(() => useEventOperations(true));

    await act(async () => {
      await result.current.fetchEvents();
    });

    const updatedEvent = {
      id: '1',
      title: '기존 회의1',
      date: '2024-10-15',
      startTime: '09:00',
      endTime: '11:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    } as Event;

    await act(async () => {
      await result.current.saveEvent(updatedEvent);
    });

    expect(result.current.events).toEqual([updatedEvent, mockEvents[1]]);
  });

  it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
    setupMockHandlerDeletion(mockEvents);

    const { result } = renderHook(() => useEventOperations(false));

    await act(async () => {
      await result.current.fetchEvents();
    });

    expect(result.current.events).toHaveLength(2);

    await act(async () => {
      await result.current.deleteEvent('1');
      await result.current.deleteEvent('2');
    });

    expect(result.current.events).toEqual([]);
  });

  it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ message: '이벤트 로딩 실패' }, { status: 500 });
      })
    );

    const { result } = renderHook(() => useEventOperations(false));

    await waitFor(() => {
      expect(result.current.events).toEqual([]);
      expect(mockToast).toHaveBeenCalledWith({
        title: '이벤트 로딩 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    });
  });

  it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
    setupMockHandlerUpdating(mockEvents);

    const { result } = renderHook(() => useEventOperations(true));

    await act(async () => {
      await result.current.fetchEvents();
    });

    const updatedEvent = {
      id: '100',
      title: '기존 회의1',
      date: '2024-10-15',
      startTime: '09:00',
      endTime: '11:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    } as Event;

    await act(async () => {
      await result.current.saveEvent(updatedEvent);
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: '일정 저장 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    });
  });

  it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
    server.use(
      http.delete('/api/events/:id', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useEventOperations(false));

    await act(async () => {
      await result.current.fetchEvents();
    });

    await act(async () => {
      await result.current.deleteEvent('1');
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: '일정 삭제 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    });
  });
});
