import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';

import { AuthGuard } from '../../guards/auth.guard';
import { AuthService } from '../../services/auth.service';
import { UiService } from '../../services/ui.service';

interface LoginFormValue {
  username: string;
  password: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss', '../../styles/form-validation.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  previousUrl: string | null;

  message: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private uiService: UiService,
    private authGuard: AuthGuard,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
    this.previousUrl = null;
  }

  onLoginSubmit(): void {
    this.loginForm.disable();
    const value = this.loginForm.value as LoginFormValue;

    this.authService.loginUser(value.username, value.password).subscribe({
      next: data => {
        this.authService.setUserData(data.token, data.user);
        this.uiService.loadSettings();
        if (this.previousUrl) {
          this.router.navigate([this.previousUrl]);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: err => {
        this.message = err.error.message;
        this.loginForm.controls['password'].reset();
        this.loginForm.enable();
      }
    });
  }

  ngOnInit() {
    this.previousUrl = this.authGuard.getRedirectUrl();
    if (this.previousUrl !== null) {
      this.message = 'You must be logged in to view that page.';
      this.authGuard.resetRedirectUrl();
    }
  }

  dismissAlert(): void {
    this.message = null;
  }
}
