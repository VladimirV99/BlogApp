import { Injectable } from '@angular/core';
import { AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {
  validateName(control: AbstractControl): ValidationErrors | null {
    const nameRegExp = new RegExp(/^[a-zA-Z'-]*$/);
    if (nameRegExp.test(control.value)) {
      return null;
    } else {
      return { validateName: true };
    }
  }

  validateUsername(control: AbstractControl): ValidationErrors | null {
    const usernameRegExp = new RegExp(/^[a-zA-Z0-9]*$/);
    if (usernameRegExp.test(control.value)) {
      return null;
    } else {
      return { validateUsername: true };
    }
  }

  validateEmail(control: AbstractControl): ValidationErrors | null {
    const emailRegExp = new RegExp(
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
    if (emailRegExp.test(control.value)) {
      return null;
    } else {
      return { validateEmail: true };
    }
  }

  validatePassword(control: AbstractControl): ValidationErrors | null {
    const passwordRegExp = new RegExp(
      /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[\d]).{0,}$/
    );
    if (passwordRegExp.test(control.value)) {
      return null;
    } else {
      return { validatePassword: true };
    }
  }

  matchingPasswords(password: string, confirmPassword: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const passwordField = control.get(password)!;
      const confirmPasswordField = control.get(confirmPassword)!;
      if (passwordField.value === confirmPasswordField.value) {
        return null;
      } else {
        return { matchingPasswords: true };
      }
    };
  }

  validateTitle(control: AbstractControl): ValidationErrors | null {
    const titleRegExp = new RegExp(/^[a-zA-Z0-9\-\s]*$/);
    if (titleRegExp.test(control.value)) {
      return null;
    } else {
      return { validateTitle: true };
    }
  }
}
