import apiClient from './client';
import { ENDPOINTS } from './config';

export const scheduleService = {
  // Get today's schedule
  getTodaySchedule: async () => {
    console.log(
      'ScheduleService: Fetching today schedule from:',
      ENDPOINTS.SCHEDULE.TODAY,
    );
    const response = await apiClient.get(ENDPOINTS.SCHEDULE.TODAY);
    console.log('ScheduleService: Raw response received:', response);
    console.log('ScheduleService: Response type:', typeof response);
    console.log(
      'ScheduleService: Response keys:',
      response ? Object.keys(response) : 'null',
    );
    return response;
  },
};

export default scheduleService;
