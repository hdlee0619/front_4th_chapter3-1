import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

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

describe('parseDateTime', () => {
  it('2024-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const date = parseDateTime('2024-07-01', '14:30');

    expect(date).toEqual(new Date('2024-07-01T14:30:00'));
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const date = parseDateTime('2024-07-01T14:30', '14:30');

    expect(date.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const date = parseDateTime('2024-07-01', '1430');

    expect(date.toString()).toBe('Invalid Date');
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const date = parseDateTime('', '14:30');

    expect(date.toString()).toBe('Invalid Date');
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event: Event = mockEvents[0];

    const dateRange = convertEventToDateRange(event);

    expect(dateRange).toEqual({
      start: new Date('2024-10-01T10:00:00'),
      end: new Date('2024-10-01T17:00:00'),
    });
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const wrongEvent = {
      date: '2024년 7월 12일',
      startTime: '14:30',
      endTime: '15:30',
    } as Event;

    const dateRange = convertEventToDateRange(wrongEvent);

    expect(dateRange.start.toString()).toBe('Invalid Date');
    expect(dateRange.end.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const wrongEvent = {
      date: '2024-07-01',
      startTime: '14시 30분',
      endTime: '15시 30분',
    } as Event;

    const dateRange = convertEventToDateRange(wrongEvent);

    expect(dateRange.start.toString()).toBe('Invalid Date');
    expect(dateRange.end.toString()).toBe('Invalid Date');
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event1: Event = mockEvents[0];

    const event2: Event = mockEvents[1];

    expect(isOverlapping(event1, event2)).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event1: Event = {
      id: '1',
      title: '취업박람회',
      date: '2024-10-01',
      startTime: '10:00',
      endTime: '12:00',
      description: '취업박람회 참가',
      location: '강남',
      category: '취업',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const event2: Event = {
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
    };

    expect(isOverlapping(event1, event2)).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent: Event = {
      id: '3',
      title: '회의',
      date: '2024-10-01',
      startTime: '11:00',
      endTime: '14:00',
      description: '회의 참석',
      location: '강남',
      category: '회의',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const overlappingEvents = findOverlappingEvents(newEvent, mockEvents);

    expect(overlappingEvents).toEqual([mockEvents[0], mockEvents[1]]);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent: Event = {
      id: '3',
      title: '회의',
      date: '2024-10-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '회의 참석',
      location: '강남',
      category: '회의',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const overlappingEvents = findOverlappingEvents(newEvent, mockEvents);

    expect(overlappingEvents).toEqual([]);
  });
});
