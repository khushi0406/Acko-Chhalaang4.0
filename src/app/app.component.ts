

  // ...existing code removed, only keep the correct AppComponent class and imports below...

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SpeechRecognitionService, SupportedLanguage } from './speech-recognition.service';
import { NLUService, GeneratedQuestion, NLUResult } from './nlu.service';
import { AiNluService } from './ai-nlu.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FollowupQuestionsComponent } from './followup-questions/followup-questions.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule, FollowupQuestionsComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  // Video control handlers
  playVideo() {
    const videoEl = document.querySelector('video#videoEl') as HTMLVideoElement;
    if (videoEl) {
      videoEl.play();
    }
  }

  pauseVideo() {
    const videoEl = document.querySelector('video#videoEl') as HTMLVideoElement;
    if (videoEl) {
      videoEl.pause();
    }
  }

  forwardVideo() {
    const videoEl = document.querySelector('video#videoEl') as HTMLVideoElement;
    if (videoEl) {
      videoEl.currentTime = Math.min(videoEl.currentTime + 10, videoEl.duration || Infinity);
    }
  }

  rewindVideo() {
    const videoEl = document.querySelector('video#videoEl') as HTMLVideoElement;
    if (videoEl) {
      videoEl.currentTime = Math.max(videoEl.currentTime - 10, 0);
    }
  }
  videoStream: MediaStream | null = null;

  startVideo() {
    const videoEl = document.querySelector('video#videoEl') as HTMLVideoElement;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then((stream: MediaStream) => {
          this.videoStream = stream;
          if (videoEl) {
            videoEl.srcObject = stream;
          }
        })
        .catch(err => {
          alert('Could not access webcam: ' + err);
        });
    }
  }

  stopVideo() {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      this.videoStream = null;
      const videoEl = document.querySelector('video#videoEl') as HTMLVideoElement;
      if (videoEl) {
        videoEl.srcObject = null;
      }
    }
  }
  title = 'Acko: AI-enabled Real-time Voice Transcription & Question Generator';
  transcript = '';
  questions: GeneratedQuestion[] = [];
  sentiment: NLUResult['sentiment'] = 'neutral';
  listening = false;
  language: SupportedLanguage = 'en-IN';
  doctorName = 'Dr. Smith';
  participantName = 'Patient';

  mode: 'audio' | 'video' = 'audio';

  // For editing/switching questions
  editingIndex: number | null = null;
  editedQuestion: string = '';

  constructor(
    private speechService: SpeechRecognitionService,
    private nlu: NLUService,
    private aiNlu: AiNluService
  ) {
    this.speechService.transcript$.subscribe(text => {
      this.transcript = text;
      // Use AI NLU service for real API, fallback to mock NLU if needed
      this.aiNlu.analyzeTranscript(text).subscribe(result => {
        if (result.questions.length > 0) {
          this.questions = result.questions;
          this.sentiment = result.sentiment;
        } else {
          const nluResult = this.nlu.analyzeTranscript(text);
          this.questions = nluResult.questions;
          this.sentiment = nluResult.sentiment;
        }
      });
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