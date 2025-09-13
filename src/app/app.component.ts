import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SpeechRecognitionService, SupportedLanguage } from './speech-recognition.service';
import { QuestionGeneratorService } from './question-generator.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,CommonModule,FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Acko: AI-enabled Real-time Voice Transcription & Question Generator';
  transcript = '';
  questions: string[] = [];
  listening = false;
  language: SupportedLanguage = 'en-IN';

  constructor(
    private speechService: SpeechRecognitionService,
    private questionService: QuestionGeneratorService
  ) {
    this.speechService.transcript$.subscribe(text => {
      this.transcript = text;
      this.questions = this.questionService.generateQuestions(text);
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
}
