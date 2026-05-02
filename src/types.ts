export type ExamType = 'TYT' | 'AYT';
export type QuestionStatus = 'correct' | 'wrong' | 'empty';

export interface QuestionEntry {
  status: QuestionStatus;
  subject: string;
  note: string;
}

export interface Exam {
  id: string;
  date: string;
  type: ExamType;
  title: string;
  questions: QuestionEntry[];
  totalCorrect: number;
  totalWrong: number;
  totalEmpty: number;
  net: number;
}

export interface SubjectList {
  [key: string]: string[];
}
