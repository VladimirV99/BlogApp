import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../services/auth.service';
import { UiService } from '../../services/ui.service';
import { ValidationService } from '../../services/validation.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss', '../../styles/form-validation.scss']
})
export class RegisterComponent {
  message: string = '';

  registerForm: FormGroup;

  usernameChecked: boolean = true;
  usernameValid: boolean = true;
  usernameMessage: string = '';
  emailChecked: boolean = true;
  emailValid: boolean = true;
  emailMessage: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private uiService: UiService,
    private validationService: ValidationService,
    private router: Router
  ) {
    this.registerForm = this.formBuilder.group(
      {
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
        username: [
          '',
          Validators.compose([
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(15),
            this.validationService.validateUsername
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
        ],
        password: [
          '',
          Validators.compose([
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(35),
            this.validationService.validatePassword
          ])
        ],
        confirmPassword: ['', Validators.required]
      },
      {
        validators: this.validationService.matchingPasswords(
          'password',
          'confirmPassword'
        )
      }
    );
  }

  onRegisterSubmit(): void {
    this.registerForm.disable();

    const newUser = this.registerForm.value;

    this.authService
      .registerUser(
        newUser.first_name,
        newUser.last_name,
        newUser.username,
        newUser.email,
        newUser.password
      )
      .subscribe({
        next: data => {
          this.authService.setUserData(data.token, data.user);
          this.uiService.loadSettings();
          this.router.navigate(['/']);
        },
        error: err => {
          this.message = err.error.message;
          this.registerForm.enable();
        }
      });
  }

  checkEmail(): void {
    const emailControl = this.registerForm.get('email') as FormControl;
    if (emailControl.value == '' || emailControl.errors) {
      this.clearEmail();
      return;
    }
    // TODO: Error handling
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

  checkUsername(): void {
    const usernameControl = this.registerForm.get('username') as FormControl;
    if (usernameControl.value == '' || usernameControl.errors) {
      this.clearUsername();
      return;
    }
    // TODO: Error handling
    this.authService.checkUsername(usernameControl.value).subscribe(data => {
      this.usernameChecked = true;
      if (!data.available) {
        this.usernameValid = false;
        this.usernameMessage = 'Username is already taken';
      } else {
        this.usernameValid = true;
        this.usernameMessage = 'Username is available';
      }
    });
  }

  clearUsername(): void {
    this.usernameChecked = false;
    this.usernameValid = false;
    this.usernameMessage = '';
  }

  dismissAlert(): void {
    this.message = '';
  }
}
