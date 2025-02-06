import { HOLIDAY_RECORD } from '../config/holidays.ts';

export type HolidayRecord = typeof HOLIDAY_RECORD;

export type HolidayKeys = keyof HolidayRecord;
