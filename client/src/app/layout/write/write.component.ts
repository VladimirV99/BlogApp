import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { EditorComponent } from '../../components/editor/editor.component';
import { PostService } from '../../services/post.service';
import { ValidationService } from '../../services/validation.service';

export interface CreatePostRequest {
  title: string;
  body: string;
}

@Component({
  selector: 'app-write',
  standalone: true,
  imports: [CommonModule, EditorComponent, ReactiveFormsModule],
  templateUrl: './write.component.html',
  styleUrls: ['./write.component.scss', '../../styles/form-validation.scss']
})
export class WriteComponent {
  @ViewChild('editor', { static: false }) editor!: EditorComponent;

  // TODO: Notification service
  message: string = '';
  messageClass: string = '';

  writeForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private postService: PostService,
    private validationService: ValidationService
  ) {
    this.writeForm = this.formBuilder.group({
      title: [
        '',
        Validators.compose([
          Validators.required,
          Validators.maxLength(60),
          Validators.minLength(1),
          this.validationService.validateTitle
        ])
      ],
      body: [
        '',
        Validators.compose([
          Validators.required,
          Validators.maxLength(1500),
          Validators.minLength(5)
        ])
      ]
    });
  }

  onWriteSubmit(): void {
    this.writeForm.disable();

    const post: CreatePostRequest = this.writeForm.value;
    this.postService.createPost(post).subscribe({
      next: data => {
        this.messageClass = 'alert-success';
        this.message = 'Post Saved!';

        this.editor.reset();
        this.writeForm.reset();
        this.writeForm.enable();
      },
      error: err => {
        this.messageClass = 'alert-danger';
        this.message = err.error.message;
        this.writeForm.enable();
      }
    });
  }

  dismissAlert(): void {
    this.message = '';
    this.messageClass = '';
  }
}
