export interface HistoryEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  content?: string;
}

export interface TimelineData {
  events: HistoryEvent[];
  keyword: string;
}