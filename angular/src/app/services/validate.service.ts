import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidateService {

  constructor() { }

  validateName(controls) {
    const nameRegExp = new RegExp(/^[a-zA-Z0-9'-]+$/);
    if (nameRegExp.test(controls.value)) {
      return null;
    } else {
      return { 'validateName': true }
    }
  }

  validateUsername(controls) {
    const usernameRegExp = new RegExp(/^[a-zA-Z0-9]+$/);
    if (usernameRegExp.test(controls.value)) {
      return null;
    } else {
      return { 'validateUsername': true }
    }
  }

  validateEmail(controls) {
    const emailRegExp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    if (emailRegExp.test(controls.value)) {
      return null;
    } else {
      return { 'validateEmail': true }
    }
  }

  validatePassword(controls) {
    const passwordRegExp = new RegExp(/^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[\d]).{0,}$/);
    if (passwordRegExp.test(controls.value)) {
      return null;
    } else {
      return { 'validatePassword': true }
    }
  }

  matchingPasswords(password, confirmPassword) {
    return (group: FormGroup) => {
      if (group.controls[password].value === group.controls[confirmPassword].value) {
        return null;
      } else {
        return { 'matchingPasswords': true }
      }
    }
  }

  validateTitle(controls) {
    const titleRegExp = new RegExp(/^[a-zA-Z0-9\-\s]+$/);
    if (titleRegExp.test(controls.value)) {
      return null;
    } else {
      return { 'validateTitle': true }
    }
  }

}
