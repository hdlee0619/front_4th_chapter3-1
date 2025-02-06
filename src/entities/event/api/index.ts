import ky from 'ky';

import { Event, EventForm } from '../model';

export interface EventsResponse {
  events: Event[];
}

export const fetchEvents = async (): Promise<EventsResponse> => {
  return ky.get('/api/events').json();
};

export const addEvent = async (eventData: EventForm): Promise<Event[]> => {
  return ky.post('/api/events', { json: eventData }).json();
};

export const updateEvent = async (eventData: Event): Promise<Event> => {
  return ky.put(`/api/events/${eventData.id}`, { json: eventData }).json();
};

export const deleteEvent = async (id: Event['id']): Promise<Event[]> => {
  return ky.delete(`/api/events/${id}`).json();
};
