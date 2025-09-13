import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class QuestionGeneratorService {
  // This is a mock. Replace with real AI API integration as needed.
  generateQuestions(transcript: string): string[] {
    if (!transcript.trim()) return [];
    // Simple heuristic: generate a question for each sentence
    return transcript.split('.').map(s => s.trim()).filter(Boolean).map(s => `What do you mean by: "${s}"?`);
  }
}
