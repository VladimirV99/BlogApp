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
    this.loadToken();
    this.loadUser();
  }

  loadToken(): void {
    const token = localStorage.getItem('token');
    this.authToken = token;
  }

  loadUser(): void {
    if(this.authToken) {
      let userData = localStorage.getItem('user');
      if(userData)
        this.user = JSON.parse(userData);
      this.getProfile().subscribe(data => {
        if (data.success) {
          this.user = data.user;
        }
      });
    }
  }

  createHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  createAuthenticationHeaders(): HttpHeaders {
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
    this.authToken = token;
  }

  storeUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.user = user;
  }

  setUserData(token: string, user: User): void {
    this.storeToken(token);
    this.storeUser(user);
  }

  loggedIn(): boolean {
    if(!this.authToken || this.jwtHelper.isTokenExpired(this.authToken))
      return false;
    return this.user != null;
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
    let options = {headers: new HttpHeaders({
      'Authorization': this.authToken
    })};
    return this.http.post<AuthMessage>(this.domain + 'users/uploadPhoto', formData, options);
  }

  getUserProfile(username: string): Observable<AuthMessage> {
    let headers = this.createHeaders();
    return this.http.get<AuthMessage>(this.domain + 'users/get/' + username, {headers: headers});
  }

  addBookmark(id: string): Observable<AuthMessage> {
    let headers = this.createAuthenticationHeaders();
    return this.http.put<AuthMessage>(this.domain + 'users/bookmark/add', { id }, {headers: headers});
  }

  removeBookmark(id: string): Observable<AuthMessage> {
    let headers = this.createAuthenticationHeaders();
    return this.http.put<AuthMessage>(this.domain + 'users/bookmark/remove', { id }, {headers: headers});
  }

}
