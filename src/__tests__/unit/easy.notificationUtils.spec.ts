import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

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

describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const now = new Date('2024-10-01T09:50:00');
    const notifiedEvents: string[] = [];
    const upcomingEvents = getUpcomingEvents(mockEvents, now, notifiedEvents);
    expect(upcomingEvents).toHaveLength(1);
    expect(upcomingEvents[0].id).toBe('1');
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const now = new Date('2024-10-01T09:50:00');
    const notifiedEvents = ['1'];
    const upcomingEvents = getUpcomingEvents(mockEvents, now, notifiedEvents);
    expect(upcomingEvents).toHaveLength(0);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const now = new Date('2024-10-01T09:00:00');
    const notifiedEvents: string[] = [];
    const upcomingEvents = getUpcomingEvents(mockEvents, now, notifiedEvents);
    expect(upcomingEvents).toHaveLength(0);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const now = new Date('2024-10-01T10:20:00');
    const notifiedEvents: string[] = [];
    const upcomingEvents = getUpcomingEvents(mockEvents, now, notifiedEvents);
    expect(upcomingEvents).toHaveLength(0);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event = mockEvents[0];
    const message = createNotificationMessage(event);
    expect(message).toBe('10분 후 취업박람회 일정이 시작됩니다.');
  });
});
