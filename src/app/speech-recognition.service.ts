import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type SupportedLanguage = 'en-IN' | 'hi-IN';

@Injectable({ providedIn: 'root' })
export class SpeechRecognitionService {
  private recognition: any;
  private isListening = false;
  private transcriptSubject = new BehaviorSubject<string>('');
  transcript$ = this.transcriptSubject.asObservable();
  private currentLanguage: SupportedLanguage = 'en-IN';

  constructor(private zone: NgZone) {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const { webkitSpeechRecognition }: any = window as any;
      this.recognition = new webkitSpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = this.currentLanguage;
      this.recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        this.zone.run(() => {
          this.transcriptSubject.next(transcript);
        });
      };
      this.recognition.onerror = (event: any) => {
        this.zone.run(() => {
          this.isListening = false;
        });
      };
      this.recognition.onend = () => {
        this.zone.run(() => {
          this.isListening = false;
        });
      };
    }
  }

  start() {
    if (this.recognition && !this.isListening) {
      this.isListening = true;
      this.recognition.lang = this.currentLanguage;
      this.recognition.start();
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      this.isListening = false;
      this.recognition.stop();
    }
  }

  switchLanguage(lang: SupportedLanguage) {
    this.currentLanguage = lang;
    if (this.isListening) {
      this.stop();
      setTimeout(() => this.start(), 300); // Restart with new language
    }
  }

  getCurrentLanguage() {
    return this.currentLanguage;
  }
}
