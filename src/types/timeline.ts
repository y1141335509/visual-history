export interface HistoryEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  content: string;
  significance: string;
  relatedFigures: string[];
}

export interface TimelineData {
  events: HistoryEvent[];
  keyword: string;
}