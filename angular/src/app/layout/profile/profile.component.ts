import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthService } from '../../services/auth.service';
import { ValidateService } from '../../services/validate.service';
import { UiService } from 'src/app/services/ui.service';
import User from 'src/app/models/user';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss', '../../post.scss']
})
export class ProfileComponent implements OnInit {

  newPhotoFile: File;
  newPhoto: string;
  noPhoto: string = this.uiService.noPhoto();

  message: string = '';
  messageClass: string = '';

  user: User;

  processingProfileUpdate: boolean = false;
  processingPasswordChange: boolean = false;

  photoUpdateForm: FormGroup;
  profileUpdateForm: FormGroup;
  passwordChangeForm: FormGroup;

  emailChecked: boolean = false;
  emailValid: boolean;
  emailMessage: string;

  loading: boolean = true;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private validateService: ValidateService,
    private uiService: UiService
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
      first_name: ['', Validators.compose([
        Validators.required,
        Validators.maxLength(15),
        this.validateService.validateName
      ])],
      last_name: ['', Validators.compose([
        Validators.required,
        Validators.maxLength(15),
        this.validateService.validateName
      ])],
      email: ['', Validators.compose([
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(30),
        this.validateService.validateEmail
      ])]
    });
  }

  createPasswordChangeForm(): void {
    this.passwordChangeForm = this.formBuilder.group({
      old_password: ['', 
        Validators.required
      ],
      new_password: ['', Validators.compose([
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(35),
        this.validateService.validatePassword
      ])],
      new_password_confirm: ['', Validators.required]
    }, { validator: this.validateService.matchingPasswords('new_password', 'new_password_confirm') });
  }

  disableProfileUpdateForm(): void {
    this.profileUpdateForm.controls['first_name'].disable();
    this.profileUpdateForm.controls['last_name'].disable();
    this.profileUpdateForm.controls['email'].disable();
  }

  enableProfileUpdateForm(): void {
    this.profileUpdateForm.controls['first_name'].enable();
    this.profileUpdateForm.controls['last_name'].enable();
    this.profileUpdateForm.controls['email'].enable();
  }

  onProfileUpdateSubmit(): void {
    this.processingProfileUpdate = true;
    this.disableProfileUpdateForm();
    
    let first_name = this.profileUpdateForm.get('first_name').value;
    let last_name = this.profileUpdateForm.get('last_name').value;
    let email = this.profileUpdateForm.get('email').value;

    this.authService.updateProfile(first_name, last_name, email).subscribe(data => {
      if (!data.success) {
        this.messageClass = 'alert alert-danger';
        this.message = data.message;
      } else {
        this.messageClass = 'alert alert-success';
        this.message = data.message;
      }
      this.processingProfileUpdate = false;
      this.enableProfileUpdateForm();
    });
  }

  disablePasswordChangeForm(): void {
    this.passwordChangeForm.controls['old_password'].disable();
    this.passwordChangeForm.controls['new_password'].disable();
    this.passwordChangeForm.controls['new_password_confirm'].disable();
  }

  enablePasswordChangeForm(): void {
    this.passwordChangeForm.controls['old_password'].enable();
    this.passwordChangeForm.controls['new_password'].enable();
    this.passwordChangeForm.controls['new_password_confirm'].enable();
  }

  onPasswordChangeSubmit(): void {
    this.processingPasswordChange = true;
    this.disablePasswordChangeForm();
    
    let old_password = this.passwordChangeForm.get('old_password').value;
    let new_password = this.passwordChangeForm.get('new_password').value;

    this.authService.changePassword(old_password, new_password).subscribe(data => {
      if(!data.success) {
        this.messageClass = 'alert alert-danger';
        this.message = data.message;
      } else {
        this.messageClass = 'alert alert-success';
        this.message = data.message;
      }
      this.passwordChangeForm.controls['old_password'].reset();
      this.passwordChangeForm.controls['new_password'].reset();
      this.passwordChangeForm.controls['new_password_confirm'].reset();
      this.processingPasswordChange = false;
      this.enablePasswordChangeForm();
    });
  }

  checkEmail(): void {
    if(this.profileUpdateForm.get('email').value=='' || this.profileUpdateForm.get('email').errors){
      this.clearEmail();
      return;
    }
    if(this.profileUpdateForm.get('email').value==this.user.email){
      this.emailChecked = true;
      this.emailValid = true;
      this.emailMessage = '';
      return;
    }
    this.authService.checkEmail(this.profileUpdateForm.get('email').value).subscribe(data => {
      this.emailChecked = true;
      if (!data.success) {
        this.emailValid = false;
        this.emailMessage = data.message;
      } else {
        this.emailValid = true;
        this.emailMessage = data.message;
      }
    });
  }

  clearEmail(): void {
    this.emailChecked = false;
    this.emailValid = false;
    this.emailMessage = '';
  }

  ngOnInit() {
    this.authService.getProfile().subscribe(data => {
      if (!data.success) {
        this.messageClass = 'alert alert-danger';
        this.message = data.message;
      } else {
        this.user = data.user;
        this.user.photo = this.user.photo ? this.uiService.getPhoto(this.user.photo) : this.noPhoto;
        this.profileUpdateForm.controls['first_name'].setValue(data.user.first_name);
        this.profileUpdateForm.controls['last_name'].setValue(data.user.last_name);
        this.profileUpdateForm.controls['email'].setValue(data.user.email);
        this.emailChecked = true;
        this.emailValid = true;
        this.emailMessage = '';
        this.loading = false;
      }
    });
  }

  onPhotoSubmit(): void {
    this.authService.uploadPhoto(this.newPhotoFile).subscribe(data => {
      if (!data.success) {
        this.messageClass = 'alert alert-danger';
        this.message = data.message;
      } else {
        this.messageClass = 'alert alert-success';
        this.message = data.message;
      }
    });
  }

  onPhotoSelect(event): void {
    if (event.target.files && event.target.files[0]) {
      this.newPhotoFile = event.target.files[0];

      const reader = new FileReader();
      reader.onload = e => this.newPhoto = reader.result.toString();
      reader.readAsDataURL(this.newPhotoFile);
    }
  }

  dismissAlert(): void {
    this.message = '';
    this.messageClass = '';
  }

}
