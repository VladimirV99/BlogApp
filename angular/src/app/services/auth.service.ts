import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import User from '../models/user';
import { Observable } from 'rxjs';

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

  private jwtHelper: JwtHelperService;
  private domain: string = 'http://localhost:3000/';
  private authToken: string;
  private user: User;

  constructor(private http: HttpClient) {
    this.jwtHelper = new JwtHelperService();
    let storage = localStorage.getItem('user');
    if(storage)
      this.user = JSON.parse(storage);
  }

  loadToken(): void {
    const token = localStorage.getItem('token');
    this.authToken = token;
  }

  createHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  createAuthenticationHeaders(): HttpHeaders {
    this.loadToken();
    if(!this.authToken)
      return this.createHeaders();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.authToken
    });
  }

  getUser(): User {
    return this.user;
  }

  getDomain(): string {
    return this.domain;
  }

  checkUsername(username: string): Observable<AuthMessage> {
    let headers = this.createHeaders();
    return this.http.get<AuthMessage>(this.domain + 'users/checkUsername/' + username, {headers: headers});
  }

  checkEmail(email: string): Observable<AuthMessage> {
    let headers = this.createHeaders();
    return this.http.get<AuthMessage>(this.domain + 'users/checkEmail/' + email, {headers: headers});
  }

  registerUser(first_name: string, last_name: string, username: string, email: string, password: string): Observable<AuthMessage> {
    let headers = this.createHeaders();
    return this.http.post<AuthMessage>(this.domain + 'users/register', {first_name, last_name, username, email, password}, {headers: headers});
  }

  loginUser(username: string, password: string): Observable<AuthMessage> {
    let headers = this.createHeaders();
    return this.http.post<AuthMessage>(this.domain + 'users/login', {username, password}, {headers: headers});
  }

  storeToken(token: string): void {
    localStorage.setItem('token', token);
  }

  storeUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  setUserData(token: string, user: User): void {
    this.storeToken(token);
    this.storeUser(user);
    this.authToken = token;
    this.user = user;
  }

  loggedIn(): boolean {
    this.loadToken();
    if(!this.authToken)
      return false;
    return !this.jwtHelper.isTokenExpired(this.authToken);
  }

  logout(): void {
    this.authToken = null;
    this.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  setDarkMode(status: boolean): Observable<AuthMessage> {
    let headers = this.createAuthenticationHeaders();
    return this.http.post<AuthMessage>(this.domain + 'users/darkMode', {status}, {headers: headers});
  }

  setRoundIcons(status: boolean): Observable<AuthMessage> {
    let headers = this.createAuthenticationHeaders();
    return this.http.post<AuthMessage>(this.domain + 'users/roundIcons', {status}, {headers: headers});
  }

  getProfile(): Observable<AuthMessage> {
    let headers = this.createAuthenticationHeaders();
    return this.http.get<AuthMessage>(this.domain + 'users/profile', {headers: headers});
  }

  updateProfile(first_name: string, last_name: string, email: string): Observable<AuthMessage> {
    let headers = this.createAuthenticationHeaders();
    return this.http.put<AuthMessage>(this.domain + 'users/update', {first_name, last_name, email}, {headers: headers});
  }

  changePassword(old_password: string, new_password: string): Observable<AuthMessage> {
    let headers = this.createAuthenticationHeaders();
    return this.http.post<AuthMessage>(this.domain + 'users/changePassword', {old_password, new_password}, {headers: headers});
  }

  uploadPhoto(photo: File): Observable<AuthMessage> {
    const formData = new FormData();
    formData.append('userPhoto', photo, photo.name);
    this.loadToken();
    let options = {headers: new HttpHeaders({
      'Authorization': this.authToken
    })};
    return this.http.post<AuthMessage>(this.domain + 'users/uploadPhoto', formData, options);
  }

  getUserProfile(username: string): Observable<AuthMessage> {
    let headers = this.createHeaders();
    return this.http.get<AuthMessage>(this.domain + 'users/get/' + username, {headers: headers});
  }

}
