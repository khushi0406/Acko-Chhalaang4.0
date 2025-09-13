import { Component, Input, Output, EventEmitter } from '@angular/core';
import { GeneratedQuestion } from '../nlu.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-followup-questions',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './followup-questions.component.html',
  styleUrls: ['./followup-questions.component.scss']
})
export class FollowupQuestionsComponent {
  @Input() questions: GeneratedQuestion[] = [];
  @Input() editingIndex: number | null = null;
  @Input() editedQuestion: string = '';
  @Output() accept = new EventEmitter<number>();
  @Output() edit = new EventEmitter<number>();
  @Output() save = new EventEmitter<number>();
  @Output() cancel = new EventEmitter<void>();
  @Output() swap = new EventEmitter<number>();
}
