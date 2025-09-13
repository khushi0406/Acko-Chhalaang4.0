import { Injectable } from '@angular/core';

export interface GeneratedQuestion {
  question: string;
  type: 'open-ended' | 'binary' | 'scale';
}

export interface NLUResult {
  questions: GeneratedQuestion[];
  sentiment: 'neutral' | 'positive' | 'negative' | 'confused' | 'distressed';
}

@Injectable({ providedIn: 'root' })
export class NLUService {
  // Mock NLU: Replace with real NLP/ML integration as needed
  analyzeTranscript(transcript: string): NLUResult {
    const questions: GeneratedQuestion[] = [];
    let sentiment: NLUResult['sentiment'] = 'neutral';
    if (!transcript.trim()) return { questions, sentiment };

    // Simple sentiment/emotion detection
    const lower = transcript.toLowerCase();
    if (/(confused|don't understand|lost|unclear)/.test(lower)) {
      sentiment = 'confused';
    } else if (/(pain|sad|worried|scared|afraid|distress)/.test(lower)) {
      sentiment = 'distressed';
    } else if (/(yes|good|better|improved|happy)/.test(lower)) {
      sentiment = 'positive';
    } else if (/(no|bad|worse|declined|sad)/.test(lower)) {
      sentiment = 'negative';
    }

    // Simple question generation logic
    const sentences = transcript.split('.').map(s => s.trim()).filter(Boolean);
    for (const s of sentences) {
      // If the sentence contains a number, ask a scale question
      if (/\d/.test(s)) {
        questions.push({
          question: `On a scale of 1-10, how would you rate: "${s}"?`,
          type: 'scale',
        });
      } else if (/yes|no|do you|are you|have you|is it|was it|can you/i.test(s)) {
        questions.push({
          question: `Is this a Yes or No: "${s}"?`,
          type: 'binary',
        });
      } else {
        questions.push({
          question: `Can you elaborate on: "${s}"?`,
          type: 'open-ended',
        });
      }
    }
    return { questions, sentiment };
  }
}
