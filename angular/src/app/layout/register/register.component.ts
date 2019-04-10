import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { ValidateService } from '../../services/validate.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss', '../../form-validation.scss']
})
export class RegisterComponent implements OnInit {

  message: string = '';

  registerForm: FormGroup;
  processing: boolean = false;
  usernameChecked: boolean = false;
  usernameValid: boolean;
  usernameMessage: string;
  emailChecked: boolean = false;
  emailValid: boolean;
  emailMessage: string;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private validateService: ValidateService
  ) { 
    this.createForm();
  }

  createForm(): void {
    this.registerForm = this.formBuilder.group({
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
      username: ['', Validators.compose([
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(15),
        this.validateService.validateUsername
      ])],
      email: ['', Validators.compose([
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(30),
        this.validateService.validateEmail
      ])],
      password: ['', Validators.compose([
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(35),
        this.validateService.validatePassword
      ])],
      confirmPassword: ['', Validators.required]
    }, { validator: this.validateService.matchingPasswords('password', 'confirmPassword') });
  }

  disableForm(): void {
    this.registerForm.controls['first_name'].disable();
    this.registerForm.controls['last_name'].disable();
    this.registerForm.controls['email'].disable();
    this.registerForm.controls['username'].disable();
    this.registerForm.controls['password'].disable();
    this.registerForm.controls['confirmPassword'].disable();
  }

  enableForm(): void {
    this.registerForm.controls['first_name'].enable();
    this.registerForm.controls['last_name'].enable();
    this.registerForm.controls['email'].enable();
    this.registerForm.controls['username'].enable();
    this.registerForm.controls['password'].enable();
    this.registerForm.controls['confirmPassword'].enable();
  }

  onRegisterSubmit(): void {
    this.processing = true;
    this.disableForm();
    
    let first_name = this.registerForm.get('first_name').value;
    let last_name = this.registerForm.get('last_name').value;
    let username = this.registerForm.get('username').value;
    let email = this.registerForm.get('email').value;
    let password = this.registerForm.get('password').value;

    this.authService.registerUser(first_name, last_name, username, email, password).subscribe(data => {
      if (!data.success) {
        this.message = data.message;
        this.processing = false;
        this.enableForm();
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  checkEmail(): void {
    if(this.registerForm.get('email').value=='' || this.registerForm.get('email').errors){
      this.clearEmail();
      return;
    }
    this.authService.checkEmail(this.registerForm.get('email').value).subscribe(data => {
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

  checkUsername(): void {
    if(this.registerForm.get('username').value=='' || this.registerForm.get('username').errors){
      this.clearUsername();
      return;
    }
    this.authService.checkUsername(this.registerForm.get('username').value).subscribe(data => {
      this.usernameChecked = true;
      if (!data.success) {
        this.usernameValid = false;
        this.usernameMessage = data.message;
      } else {
        this.usernameValid = true;
        this.usernameMessage = data.message;
      }
    });
  }

  clearUsername(): void {
    this.usernameChecked = false;
    this.usernameValid = false;
    this.usernameMessage = '';
  }

  ngOnInit() {
  }

  dismissAlert(): void {
    this.message = '';
  }

}
