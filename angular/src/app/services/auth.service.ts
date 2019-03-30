import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { User } from '../models/user';

export interface AuthMessage {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  jwtHelper: JwtHelperService;
  domain: string = 'http://localhost:3000/';
  authToken: any;
  user: any;

  constructor(private http: HttpClient) {
    this.jwtHelper = new JwtHelperService();
    let storage = localStorage.getItem('user');
    if(storage)
      this.user = JSON.parse(storage);
  }

  loadToken() {
    const token = localStorage.getItem('token');
    this.authToken = token;
  }

  createHeaders() {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  createAuthenticationHeaders() {
    this.loadToken();
    if(!this.authToken)
      return this.createHeaders();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.authToken
    });
  }

  checkUsername(username) {
    let headers = this.createHeaders();
    return this.http.get<AuthMessage>(this.domain + 'users/checkUsername/' + username, {headers: headers});
  }

  checkEmail(email) {
    let headers = this.createHeaders();
    return this.http.get<AuthMessage>(this.domain + 'users/checkEmail/' + email, {headers: headers});
  }

  registerUser(user) {
    let headers = this.createHeaders();
    return this.http.post<AuthMessage>(this.domain + 'users/register', user, {headers: headers});
  }

  loginUser(user) {
    let headers = this.createHeaders();
    return this.http.post<AuthMessage>(this.domain + 'users/login', user, {headers: headers});
  }

  storeUserData(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.authToken = token;
    this.user = user;
  }

  loggedIn() {
    this.loadToken();
    if(!this.authToken)
      return false;
    return !this.jwtHelper.isTokenExpired(this.authToken);
  }

  logout() {
    this.authToken = null;
    this.user = null;
    localStorage.clear();
  }

  getProfile() {
    let headers = this.createAuthenticationHeaders();
    return this.http.get<AuthMessage>(this.domain + 'users/profile', {headers: headers});
  }

  updateProfile(user) {
    let headers = this.createAuthenticationHeaders();
    return this.http.put<AuthMessage>(this.domain + 'users/update', user, {headers: headers});
  }

  changePassword(user) {
    let headers = this.createAuthenticationHeaders();
    return this.http.post<AuthMessage>(this.domain + 'users/changePassword', user, {headers: headers});
  }

  uploadPhoto(photo: File) {
    const formData = new FormData();
    formData.append('userPhoto', photo, photo.name);
    this.loadToken();
    let options = {headers: new HttpHeaders({
      'Authorization': this.authToken
    })};
    return this.http.post<AuthMessage>(this.domain + 'users/uploadPhoto', formData, options);
  }

  getUserProfile(username: string) {
    let headers = this.createHeaders();
    return this.http.get<AuthMessage>(this.domain + 'users/get/' + username, {headers: headers});
  }

}
