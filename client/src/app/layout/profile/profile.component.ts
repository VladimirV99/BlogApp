import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '../../services/auth.service';
import { ValidationService } from '../../services/validation.service';
import { UiService } from '../../services/ui.service';
import { User } from '../../models/user';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: [
    './profile.component.scss',
    '../../styles/post.scss',
    '../../styles/form-validation.scss'
  ]
})
export class ProfileComponent implements OnInit {
  newPhotoFile: File | null = null;
  newPhoto: string | null = null;
  noPhoto: string = this.uiService.noPhoto();

  message: string = '';
  messageClass: string = '';

  user!: User; // TODO

  photoUpdateForm!: FormGroup;
  profileUpdateForm!: FormGroup;
  passwordChangeForm!: FormGroup;

  emailChecked: boolean = false;
  emailValid: boolean = false;
  emailMessage: string = '';

  loading: boolean = true;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private validationService: ValidationService,
    public uiService: UiService
  ) {
    this.createPhotoUpdateForm();
    this.createProfileUpdateForm();
    this.createPasswordChangeForm();
  }

  createPhotoUpdateForm(): void {
    this.photoUpdateForm = this.formBuilder.group({
      userPhoto: ['', Validators.required]
    });
  }

  createProfileUpdateForm(): void {
    this.profileUpdateForm = this.formBuilder.group({
      first_name: [
        '',
        Validators.compose([
          Validators.required,
          Validators.maxLength(15),
          this.validationService.validateName
        ])
      ],
      last_name: [
        '',
        Validators.compose([
          Validators.required,
          Validators.maxLength(15),
          this.validationService.validateName
        ])
      ],
      email: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(30),
          this.validationService.validateEmail
        ])
      ]
    });
  }

  createPasswordChangeForm(): void {
    this.passwordChangeForm = this.formBuilder.group(
      {
        old_password: ['', Validators.required],
        new_password: [
          '',
          Validators.compose([
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(35),
            this.validationService.validatePassword
          ])
        ],
        new_password_confirm: ['', Validators.required]
      },
      {
        validators: this.validationService.matchingPasswords(
          'new_password',
          'new_password_confirm'
        )
      }
    );
  }

  onProfileUpdateSubmit(): void {
    this.profileUpdateForm.disable();

    const first_name = (
      this.profileUpdateForm.get('first_name') as FormControl<string>
    ).value;
    const last_name = (
      this.profileUpdateForm.get('last_name') as FormControl<string>
    ).value;
    const email = (this.profileUpdateForm.get('email') as FormControl<string>)
      .value;

    this.authService.updateProfile(first_name, last_name, email).subscribe({
      next: data => {
        this.messageClass = 'alert-success';
        this.message = 'Profile Updated';
        this.authService.updateUser(
          data.user.first_name,
          data.user.last_name,
          data.user.email
        );
        this.profileUpdateForm.enable();
      },
      error: (err: HttpErrorResponse) => {
        this.messageClass = 'alert-danger';
        this.message = err.error.message;
        this.profileUpdateForm.enable();
      }
    });
  }

  onPasswordChangeSubmit(): void {
    this.passwordChangeForm.disable();

    const old_password = (
      this.passwordChangeForm.get('old_password') as FormControl<string>
    ).value;
    const new_password = (
      this.passwordChangeForm.get('new_password') as FormControl<string>
    ).value;

    this.authService.changePassword(old_password, new_password).subscribe({
      next: data => {
        this.messageClass = 'alert-success';
        this.message = 'Password Changed';
        this.passwordChangeForm.reset();
        this.passwordChangeForm.enable();
      },
      error: (err: HttpErrorResponse) => {
        this.messageClass = 'alert-danger';
        this.message = err.error.message;
        this.passwordChangeForm.reset();
        this.passwordChangeForm.enable();
      }
    });
  }

  checkEmail(): void {
    const emailControl = this.profileUpdateForm.get(
      'email'
    ) as FormControl<string>;
    if (emailControl.value == '' || emailControl.errors) {
      this.clearEmail();
      return;
    }
    if (emailControl.value == this.user.email) {
      this.emailChecked = true;
      this.emailValid = true;
      this.emailMessage = '';
      return;
    }
    this.authService.checkEmail(emailControl.value).subscribe(data => {
      this.emailChecked = true;
      if (!data.available) {
        this.emailValid = false;
        this.emailMessage = 'E-mail is already taken';
      } else {
        this.emailValid = true;
        this.emailMessage = 'E-mail is available';
      }
    });
  }

  clearEmail(): void {
    this.emailChecked = false;
    this.emailValid = false;
    this.emailMessage = '';
  }

  ngOnInit() {
    this.authService.getProfile().subscribe({
      next: data => {
        this.user = data.user;
        this.user.photo = this.user.photo
          ? this.uiService.getPhoto(this.user.photo)
          : this.noPhoto;
        this.profileUpdateForm.controls['first_name'].setValue(
          data.user.first_name
        );
        this.profileUpdateForm.controls['last_name'].setValue(
          data.user.last_name
        );
        this.profileUpdateForm.controls['email'].setValue(data.user.email);
        this.emailChecked = true;
        this.emailValid = true;
        this.emailMessage = '';
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.messageClass = 'alert-danger';
        this.message = err.error.message;
      }
    });
  }

  onPhotoSubmit(): void {
    if (!this.newPhotoFile) return;
    this.authService.uploadPhoto(this.newPhotoFile).subscribe({
      next: data => {
        this.messageClass = 'alert-success';
        this.message = 'Photo uploaded';
      },
      error: err => {
        this.messageClass = 'alert-danger';
        this.message = err.error.message;
      }
    });
  }

  // TODO: Type for event
  onPhotoSelect(event: any): void {
    if (event.target.files && event.target.files[0]) {
      if (event.target.files[0].size >= 1000000) {
        this.messageClass = 'alert-danger';
        this.message = 'Image must be less than 1Mb';
      } else {
        this.newPhotoFile = event.target.files[0];
        const reader = new FileReader();
        reader.onload = e => {
          if (!reader.result) {
            this.messageClass = 'alert-danger';
            this.message = 'Error reading image';
            return;
          }

          let img = new Image();
          img.onload = () => {
            if (img.width == img.height) {
              this.newPhoto = reader.result!.toString();
            } else {
              this.messageClass = 'alert-danger';
              this.message = 'Image must have same height and width';
            }
          };
          img.src = reader.result!.toString();
        };
        reader.readAsDataURL(this.newPhotoFile!);
      }
    }
  }

  dismissAlert(): void {
    this.message = '';
    this.messageClass = '';
  }
}
