import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

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
    date: '2024-10-01',
    startTime: '12:00',
    endTime: '15:00',
    description: '데이트 하기',
    location: '송파',
    category: '데이트',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
] as Event[];

const currentDate = new Date('2024-10-01');

describe('getFilteredEvents', () => {
  it("검색어 '데이트'에 맞는 이벤트만 반환한다", () => {
    const filteredEvents = getFilteredEvents(mockEvents, '데이트', currentDate, 'month');

    expect(filteredEvents).toEqual([mockEvents[1]]);
  });

  it('주간 뷰에서 2024-07-01 주의 이벤트만 반환한다', () => {
    const filteredEvents = getFilteredEvents(mockEvents, '', new Date('2024-07-01'), 'week');

    expect(filteredEvents).toEqual([]);
  });

  it('월간 뷰에서 2024년 7월의 모든 이벤트를 반환한다', () => {
    const filteredEvents = getFilteredEvents(mockEvents, '', new Date('2024-07-01'), 'month');

    expect(filteredEvents).toEqual([]);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const filteredEvents = getFilteredEvents(mockEvents, '이벤트', new Date('2024-07-01'), 'week');

    expect(filteredEvents).toEqual([]);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const filteredEvents = getFilteredEvents(mockEvents, '', currentDate, 'month');

    expect(filteredEvents).toEqual(mockEvents);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const filteredEvents = getFilteredEvents(mockEvents, '데이트', currentDate, 'month');

    expect(filteredEvents).toEqual([mockEvents[1]]);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const filteredEvents = getFilteredEvents(mockEvents, '', new Date('2024-10-01'), 'month');

    expect(filteredEvents).toEqual(mockEvents);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const filteredEvents = getFilteredEvents([], '', currentDate, 'month');

    expect(filteredEvents).toEqual([]);
  });
});
