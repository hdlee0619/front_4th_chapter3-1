import { act, renderHook } from '@testing-library/react';

import { useEventStore } from '../../entities/event/model';
import { useCalendarStore } from '../../features/calendar';
import { useNotifications } from '../../hooks/useNotifications';
import { Event } from '../../types';
import { setupDate } from '../utils';

const mockEvents = [
  {
    id: '1',
    title: '취업박람회',
    date: '2024-02-05',
    startTime: '10:15',
    endTime: '17:00',
    description: '취업박람회 참가',
    location: '강남',
    category: '취업',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 15,
  },
] as Event[];

describe('useNotifications', () => {
  beforeEach(() => {
    setupDate('2024-02-05T10:00:00');
    act(() => {
      useEventStore.getState().setEvents(mockEvents);
      useCalendarStore.getState().reset();
    });
  });

  afterEach(() => {
    act(() => {
      useEventStore.getState().resetEvents();
    });
  });

  it('초기 상태에서는 알림이 없어야 한다', () => {
    const { result } = renderHook(() => useNotifications());

    expect(result.current.notifications).toHaveLength(0);
    expect(result.current.notifiedEvents).toHaveLength(0);
  });

  it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].id).toBe('1');
    expect(result.current.notifiedEvents).toContain('1');
  });

  it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.notifications).toHaveLength(1);

    act(() => {
      result.current.removeNotification(0);
    });

    expect(result.current.notifications).toHaveLength(0);
  });

  it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.notifications).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(10 * 1000);
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifiedEvents).toHaveLength(1);
  });
});
