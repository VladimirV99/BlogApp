import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { PostService } from '../../services/post.service';
import { ValidationService } from '../../services/validation.service';
import { EditorComponent } from '../../components/editor/editor.component';

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, EditorComponent],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss'
})
export class EditComponent {
  message: string = '';
  messageClass: string = '';

  editForm: FormGroup;
  processing: boolean = false;
  currentUrl!: Params;
  loading: boolean = true;

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private postService: PostService,
    private validationService: ValidationService
  ) {
    this.editForm = this.formBuilder.group({
      title: [
        '',
        Validators.compose([
          Validators.required,
          Validators.maxLength(50),
          Validators.minLength(5),
          this.validationService.validateTitle
        ])
      ],
      body: [
        '',
        Validators.compose([
          Validators.required,
          Validators.maxLength(500),
          Validators.minLength(5)
        ])
      ]
    });
  }

  disableForm(): void {
    this.editForm.controls['title'].disable();
    this.editForm.controls['body'].disable();
  }

  enableForm(): void {
    this.editForm.controls['title'].enable();
    this.editForm.controls['body'].enable();
  }

  onEditSubmit(): void {
    this.processing = true;
    this.disableForm();

    const post = {
      _id: this.currentUrl['id'],
      title: (this.editForm.get('title') as FormControl).value,
      body: (this.editForm.get('body') as FormControl).value
    };

    this.postService.editPost(post).subscribe({
      next: data => {
        this.messageClass = 'alert-success';
        this.message = 'Post Updated!';

        this.processing = false;
        this.enableForm();
      },
      error: (err: HttpErrorResponse) => {
        this.messageClass = 'alert-danger';
        this.message = err.error.message;

        this.processing = false;
        this.enableForm();
      }
    });
  }

  ngOnInit() {
    this.currentUrl = this.activatedRoute.snapshot.params;
    this.postService.getEditPost(this.currentUrl['id']).subscribe({
      next: data => {
        this.editForm.controls['title'].setValue(data.post.title);
        this.editForm.controls['body'].setValue(data.post.body);
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.messageClass = 'alert-danger';
        this.message = err.error.message;
      }
    });
  }

  dismissAlert(): void {
    this.message = '';
    this.messageClass = '';
  }
}
