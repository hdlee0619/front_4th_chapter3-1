import { act, renderHook } from '@testing-library/react';

import { useEventStore } from '../../entities/event/model';
import { useCalendarStore } from '../../features/calendar';
import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';
import { setupDate } from '../utils.ts';

const mockEvents = [
  {
    id: '1',
    title: '취업박람회',
    date: '2024-10-01',
    startTime: '10:00',
    endTime: '17:00',
    description: '취업박람회 참가',
    location: '강남',
    category: '업무',
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
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
] as Event[];

beforeEach(() => {
  setupDate('2024-10-01');
  act(() => {
    useCalendarStore.getState().reset();
    useEventStore.getState().setEvents(mockEvents);
  });
});

afterEach(() => {
  act(() => {
    useCalendarStore.getState().reset();
    useEventStore.getState().resetEvents();
  });
});

describe('검색 기능 테스트 >', () => {
  it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
    const { result } = renderHook(() => useSearch());

    expect(result.current.filteredEvents).toEqual(mockEvents);
  });

  it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setSearchTerm('데이트');
    });

    expect(result.current.filteredEvents).toEqual([mockEvents[1]]);
  });

  it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
    const { result } = renderHook(() => useSearch());
    // 제목
    act(() => {
      result.current.setSearchTerm('취업박람회');
    });
    expect(result.current.filteredEvents).toEqual([mockEvents[0]]);
    // 설명
    act(() => {
      result.current.setSearchTerm('데이트');
    });
    expect(result.current.filteredEvents).toEqual([mockEvents[1]]);
    // 위치
    act(() => {
      result.current.setSearchTerm('강남');
    });
    expect(result.current.filteredEvents).toEqual([mockEvents[0]]);
  });

  it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
    const { result } = renderHook(() => useSearch());

    act(() => {
      useCalendarStore.getState().setView('week');
    });

    expect(result.current.filteredEvents).toEqual([mockEvents[0]]);
  });

  it("검색어를 '강남'에서 '송파'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setSearchTerm('강남');
    });
    expect(result.current.filteredEvents).toEqual([mockEvents[0]]);

    act(() => {
      result.current.setSearchTerm('송파');
    });
    expect(result.current.filteredEvents).toEqual([mockEvents[1]]);
  });
});
