
// ...existing code removed, only keep the correct AppComponent class and imports below...

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SpeechRecognitionService, SupportedLanguage } from './speech-recognition.service';
import { NLUService, GeneratedQuestion, NLUResult } from './nlu.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FollowupQuestionsComponent } from './followup-questions/followup-questions.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule, MatFormFieldModule, MatInputModule, FollowupQuestionsComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Acko: AI-enabled Real-time Voice Transcription & Question Generator';
  transcript = '';
  questions: GeneratedQuestion[] = [];
  sentiment: NLUResult['sentiment'] = 'neutral';
  listening = false;
  language: SupportedLanguage = 'en-IN';
  doctorName = 'Dr. Smith';
  participantName = 'Patient';

  // For editing/switching questions
  editingIndex: number | null = null;
  editedQuestion: string = '';

  constructor(
    private speechService: SpeechRecognitionService,
    private nlu: NLUService
  ) {
    this.speechService.transcript$.subscribe(text => {
      this.transcript = text;
      const nluResult = this.nlu.analyzeTranscript(text);
      this.questions = nluResult.questions;
      this.sentiment = nluResult.sentiment;
    });
  }

  startListening() {
    this.speechService.start();
    this.listening = true;
  }

  stopListening() {
    this.speechService.stop();
    this.listening = false;
  }

  switchLanguage(lang: SupportedLanguage) {
    this.language = lang;
    this.speechService.switchLanguage(lang);
  }

  acceptQuestion(idx: number) {
    // In a real app, mark as accepted or log somewhere
    alert('Question accepted: ' + this.questions[idx].question);
  }

  startEdit(idx: number) {
    this.editingIndex = idx;
    this.editedQuestion = this.questions[idx].question;
  }

  saveEdit(idx: number) {
    if (this.editedQuestion.trim()) {
      this.questions[idx].question = this.editedQuestion;
    }
    this.editingIndex = null;
    this.editedQuestion = '';
  }

  cancelEdit() {
    this.editingIndex = null;
    this.editedQuestion = '';
  }

  swapQuestion(idx: number) {
    // In a real app, fetch a new suggestion from NLU/AI
    this.questions[idx].question = 'Alternative question for: ' + this.questions[idx].question;
  }
}