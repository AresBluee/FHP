export interface ScheduleResponseDTO {
  employeeName: string | null;
  scheduleName: string;
  startTime: string;
  endTime: string;
  workingDays: string; // <--- Cambiado de daysOfWeek: string[]
  validFrom: string; // <--- Renombrado desde startDate
  validTo: string | null; // <--- Renombrado desde endDate
}
