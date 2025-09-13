

  // ...existing code removed, only keep the correct AppComponent class and imports below...

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SpeechRecognitionService, SupportedLanguage } from './speech-recognition.service';
import { NLUService, GeneratedQuestion, NLUResult } from './nlu.service';
import { AiNluService } from './ai-nlu.service';
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
  isRecording: boolean = false;
  mediaRecorder: MediaRecorder | null = null;
  recordedChunks: Blob[] = [];
  recordedVideoUrl: string | null = null;
  videoTimer: number = 0; // seconds
  private timerInterval: any = null;
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
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream: MediaStream) => {
          this.videoStream = stream;
          if (videoEl) {
            videoEl.srcObject = stream;
          }
          this.startTimer();
          this.recordedVideoUrl = null;
          this.startRecording();
          this.speechService.start(); // Start mic transcription
          this.listening = true;
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
      this.stopTimer();
      this.stopRecording();
      this.speechService.stop(); // Stop mic transcription
      this.listening = false;
    }
  }

  startRecording() {
    if (!this.videoStream) {
      alert('Start the video first!');
      return;
    }
    this.recordedChunks = [];
    this.mediaRecorder = new MediaRecorder(this.videoStream, { mimeType: 'video/webm' });
    this.mediaRecorder.ondataavailable = (event: any) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };
    this.mediaRecorder.onstop = () => {
      const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
      this.recordedVideoUrl = URL.createObjectURL(blob);
    };
    this.mediaRecorder.start();
    this.isRecording = true;
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        this.recordedVideoUrl = URL.createObjectURL(blob);
        // Show recorded video in the same video element
        const videoEl = document.querySelector('video#videoEl') as HTMLVideoElement;
        if (videoEl) {
          videoEl.srcObject = null;
          videoEl.src = this.recordedVideoUrl;
          videoEl.controls = true;
          videoEl.play();
        }
      };
      this.mediaRecorder.stop();
      this.isRecording = false;
    }
  }

  toggleRecording() {
    if (this.isRecording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }

  startTimer() {
    this.stopTimer();
    this.videoTimer = 0;
    this.timerInterval = setInterval(() => {
      this.videoTimer++;
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
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