import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { AuthGuard } from '../../guards/auth.guard';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss', '../../form-validation.scss']
})
export class LoginComponent implements OnInit {
  message: string;

  loginForm: FormGroup;
  processing: boolean = false;
  previousUrl: string;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private authGuard: AuthGuard,
    private uiService: UiService
  ) {
    this.createForm();
  }

  createForm(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  disableForm(): void {
    this.loginForm.controls['username'].disable();
    this.loginForm.controls['password'].disable();
  }

  enableForm(): void {
    this.loginForm.controls['username'].enable();
    this.loginForm.controls['password'].enable();
  }

  onLoginSubmit(): void {
    this.processing = true;
    this.disableForm();

    let username = this.loginForm.get('username').value;
    let password = this.loginForm.get('password').value;

    this.authService.loginUser(username, password).subscribe(data => {
      if (!data.success) {
        this.message = data.message;
        this.loginForm.controls['password'].reset();
        this.processing = false;
        this.enableForm();
      } else {
        this.authService.setUserData(data.token, data.user);
        this.uiService.loadSettings();
        if (this.previousUrl) {
          this.router.navigate([this.previousUrl]);
        } else {
          this.router.navigate(['/']);
        }
      }
    });
  }

  ngOnInit() {
    if (this.authGuard.redirectUrl) {
      this.message = 'You must be logged in to view that page.';
      this.previousUrl = this.authGuard.redirectUrl;
      this.authGuard.redirectUrl = undefined;
    }
  }

  dismissAlert(): void {
    this.message = '';
  }
}
