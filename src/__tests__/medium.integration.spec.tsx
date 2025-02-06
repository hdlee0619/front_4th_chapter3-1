import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, expect, vi } from 'vitest';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils.ts';
import App from '../App';
import { server } from '../setupTests';
import { Event, EventForm } from '../types';
import { cleanupDate } from './utils.ts';

const mockEvents = [
  {
    id: '1',
    title: '취업박람회',
    date: '2024-10-03',
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

const renderApp = () => {
  return render(
    <ChakraProvider>
      <App />
    </ChakraProvider>
  );
};

beforeEach(() => {
  vi.setSystemTime(new Date('2024-10-01'));
});

afterEach(() => {
  cleanupDate();
});

describe('일정 CRUD 및 기본 기능', () => {
  const user = userEvent.setup();

  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
    setupMockHandlerCreation(mockEvents);
    renderApp();

    await waitFor(() => {
      expect(screen.getByText(/검색 결과가 없습니다/i)).toBeInTheDocument();
    });

    const newEvent = {
      title: '팀 회의',
      date: '2024-10-20',
      startTime: '14:00',
      endTime: '15:00',
      description: '주간 회의',
      location: '회의실',
      category: '업무',
    } as EventForm;

    const titleInput = screen.getByLabelText('제목');
    const dateInput = screen.getByLabelText('날짜');
    const startTimeInput = screen.getByLabelText('시작 시간');
    const endTimeInput = screen.getByLabelText('종료 시간');
    const descriptionInput = screen.getByLabelText('설명');
    const locationInput = screen.getByLabelText('위치');
    const categorySelect = screen.getByLabelText('카테고리');

    if (
      !titleInput ||
      !dateInput ||
      !startTimeInput ||
      !endTimeInput ||
      !descriptionInput ||
      !locationInput
    ) {
      throw new Error('Required form fields not found');
    }

    await user.type(titleInput, newEvent.title);
    await user.type(dateInput, newEvent.date);
    await user.type(startTimeInput, newEvent.startTime);
    await user.type(endTimeInput, newEvent.endTime);
    await user.type(descriptionInput, newEvent.description);
    await user.type(locationInput, newEvent.location);
    await user.selectOptions(categorySelect, newEvent.category);

    const submitButton = screen.getByTestId('event-submit-button');
    await user.click(submitButton);
    const eventList = screen.getByTestId('event-list');

    expect(within(eventList).getByText(newEvent.title)).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    setupMockHandlerUpdating(mockEvents);
    renderApp();

    const firstEvent = mockEvents[0];

    await waitFor(() => {
      expect(screen.getByText(firstEvent.location)).toBeInTheDocument();
    });

    const eventList = screen.getByTestId('event-list');
    const editButton = within(eventList).getAllByLabelText(/Edit event/i);
    await user.click(editButton[0]);

    const titleInput = screen.getByLabelText('제목');
    const dateInput = screen.getByLabelText('날짜');
    const startTimeInput = screen.getByLabelText('시작 시간');
    const endTimeInput = screen.getByLabelText('종료 시간');
    const descriptionInput = screen.getByLabelText('설명');
    const locationInput = screen.getByLabelText('위치');
    const categorySelect = screen.getByLabelText('카테고리');

    await user.click(editButton[0]);
    expect(titleInput).toHaveValue(firstEvent.title);
    expect(dateInput).toHaveValue(firstEvent.date);
    expect(startTimeInput).toHaveValue(firstEvent.startTime);
    expect(endTimeInput).toHaveValue(firstEvent.endTime);
    expect(descriptionInput).toHaveValue(firstEvent.description);
    expect(locationInput).toHaveValue(firstEvent.location);
    expect(categorySelect).toHaveValue(firstEvent.category);

    const updatedEvent = {
      ...firstEvent,
      title: '기존 회의1',
      startTime: '09:00',
      endTime: '11:00',
      location: '회의실 B',
    } as EventForm;

    await user.clear(titleInput);
    await user.type(titleInput, updatedEvent.title);
    await user.clear(startTimeInput);
    await user.type(startTimeInput, updatedEvent.startTime);
    await user.clear(endTimeInput);
    await user.type(endTimeInput, updatedEvent.endTime);
    await user.clear(locationInput);
    await user.type(locationInput, updatedEvent.location);

    const submitButton = screen.getByTestId('event-submit-button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(updatedEvent.location)).toBeInTheDocument();
    });

    expect(within(eventList).getByText(updatedEvent.title)).toBeInTheDocument();
    expect(within(eventList).getByText(updatedEvent.date)).toBeInTheDocument();
    expect(
      within(eventList).getByText(updatedEvent.startTime, { exact: false })
    ).toBeInTheDocument();
    expect(within(eventList).getByText(updatedEvent.endTime, { exact: false })).toBeInTheDocument();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandlerDeletion(mockEvents);
    renderApp();

    const firstEvent = mockEvents[0];

    await waitFor(() => {
      expect(screen.getByText(firstEvent.location)).toBeInTheDocument();
    });

    const eventList = screen.getByTestId('event-list');
    const deleteButton = within(eventList).getAllByLabelText(/Delete event/i);
    await user.click(deleteButton[0]);
    await user.click(deleteButton[1]);

    await waitFor(() => {
      expect(screen.queryByText(mockEvents[0].title)).toBeNull();
      expect(screen.queryByText(mockEvents[1].title)).toBeNull();
    });

    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });
});

describe('일정 뷰', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: mockEvents });
      })
    );
  });

  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    vi.setSystemTime(new Date('2025-10-30'));
    renderApp();

    const weekViewSelect = screen.getByLabelText('view');
    await user.selectOptions(weekViewSelect, 'Week');
    expect(screen.getByText('Week')).toBeInTheDocument();

    const eventList = screen.getByTestId('event-list');
    expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    vi.setSystemTime(new Date('2024-10-01'));
    renderApp();

    const weekViewSelect = screen.getByLabelText('view');
    await user.selectOptions(weekViewSelect, 'Week');
    expect(screen.getByText('Week')).toBeInTheDocument();

    const eventList = screen.getByTestId('event-list');
    expect(within(eventList).getByText(mockEvents[0].title)).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    vi.setSystemTime(new Date('2025-10-30'));
    renderApp();

    expect(screen.getByText('Month')).toBeInTheDocument();
    const eventList = screen.getByTestId('event-list');
    expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    vi.setSystemTime(new Date('2024-10-01'));
    renderApp();

    expect(screen.getByText('Month')).toBeInTheDocument();

    await waitFor(() => {
      const eventList = screen.getByTestId('event-list');
      expect(within(eventList).getByText(mockEvents[0].title)).toBeInTheDocument();
    });
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    vi.setSystemTime(new Date('2024-01-01'));
    renderApp();

    await waitFor(() => {
      expect(screen.getByText('신정')).toBeInTheDocument();
    });
  });
});

describe('검색 기능', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: mockEvents });
      })
    );
  });

  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    renderApp();

    const eventList = screen.getByTestId('event-list');
    await waitFor(() => {
      expect(within(eventList).getByText(mockEvents[0].title)).toBeInTheDocument();
    });

    const searchInput = screen.getByLabelText('일정 검색');
    await user.type(searchInput, 'test');
    await waitFor(() => {
      expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
    });
  });

  it("'데이트'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    renderApp();

    const eventList = screen.getByTestId('event-list');
    await waitFor(() => {
      expect(within(eventList).getByText(mockEvents[0].title)).toBeInTheDocument();
      expect(within(eventList).getByText(mockEvents[1].title)).toBeInTheDocument();
    });

    const searchInput = screen.getByLabelText('일정 검색');
    await user.type(searchInput, '데이트');
    await waitFor(() => {
      expect(within(eventList).queryByText(mockEvents[0].title)).not.toBeInTheDocument();
      expect(within(eventList).getByText(mockEvents[1].title)).toBeInTheDocument();
    });
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    renderApp();

    const eventList = screen.getByTestId('event-list');

    const searchInput = screen.getByLabelText('일정 검색');
    await user.type(searchInput, 'test');
    await waitFor(() => {
      expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
    });

    await user.clear(searchInput);
    await waitFor(() => {
      expect(within(eventList).getByText(mockEvents[0].title)).toBeInTheDocument();
      expect(within(eventList).getByText(mockEvents[1].title)).toBeInTheDocument();
    });
  });
});

describe('일정 충돌', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: mockEvents });
      })
    );
  });

  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    renderApp();

    const newEvent = {
      title: '겹침 테스트',
      date: '2024-10-03',
      startTime: '10:00',
      endTime: '11:00',
      description: '겹침 테스트',
      location: '강남',
      category: '업무',
    } as EventForm;

    const titleInput = screen.getByLabelText('제목');
    const dateInput = screen.getByLabelText('날짜');
    const startTimeInput = screen.getByLabelText('시작 시간');
    const endTimeInput = screen.getByLabelText('종료 시간');
    const descriptionInput = screen.getByLabelText('설명');
    const locationInput = screen.getByLabelText('위치');
    const categorySelect = screen.getByLabelText('카테고리');

    await user.type(titleInput, newEvent.title);
    await user.type(dateInput, newEvent.date);
    await user.type(startTimeInput, newEvent.startTime);
    await user.type(endTimeInput, newEvent.endTime);
    await user.type(descriptionInput, newEvent.description);
    await user.type(locationInput, newEvent.location);
    await user.selectOptions(categorySelect, newEvent.category);

    const submitButton = screen.getByTestId('event-submit-button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    });
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    renderApp();

    const secondEvent = mockEvents[1];

    const eventList = screen.getByTestId('event-list');
    await waitFor(() => {
      expect(within(eventList).getByText(secondEvent.title)).toBeInTheDocument();
    });
    const editButton = within(eventList).getAllByLabelText(/edit event/i);
    await user.click(editButton[0]);

    const date = screen.getByLabelText('날짜');
    const startTimeInput = screen.getByLabelText('시작 시간');
    const endTimeInput = screen.getByLabelText('종료 시간');

    await user.clear(date);
    await user.type(date, secondEvent.date);
    await user.clear(startTimeInput);
    await user.type(startTimeInput, secondEvent.startTime);
    await user.clear(endTimeInput);
    await user.type(endTimeInput, secondEvent.endTime);

    const submitButton = screen.getByTestId('event-submit-button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    });
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    })
  );
  vi.setSystemTime(new Date('2024-10-03T09:50:00'));
  renderApp();

  const eventList = screen.getByTestId('event-list');
  await waitFor(() => {
    expect(within(eventList).getByText(mockEvents[0].title)).toBeInTheDocument();
  });

  await waitFor(() => {
    const notificationTime = screen.getByText('10분 후 취업박람회 일정이 시작됩니다.');
    expect(notificationTime).toBeInTheDocument();
  });
});
