
export type SummaryLength = 'brief' | 'medium' | 'detailed';
export type SummaryTone = 'professional' | 'casual' | 'academic' | 'simple';
export type SummaryFormat = 'paragraph' | 'bullets';

export interface SummarizationConfig {
  length: SummaryLength;
  tone: SummaryTone;
  format: SummaryFormat;
}

export interface SummaryResult {
  id: string;
  originalText: string;
  summaryText: string;
  timestamp: number;
  config: SummarizationConfig;
  stats: {
    originalWords: number;
    summaryWords: number;
    reduction: number;
  };
}
