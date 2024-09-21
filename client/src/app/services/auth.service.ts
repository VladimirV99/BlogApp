import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { User } from '../models/user';
import { Observable } from 'rxjs';
import { API_URL } from '../../environments/environment';

interface AuthMessage {
  success: boolean;
  message: string;
}

interface AvailabilityResponse {
  // TODO: Rename to 'available'
  success: boolean;
}

interface AuthResponse {
  token: string;
  user: User;
}

interface ProfileResponse {
  user: User;
}

interface UpdateProfileResponse {
  user: { first_name: string; last_name: string; email: string };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private jwtHelper: JwtHelperService;
  private authToken: string | null;
  private user: User | null;

  constructor(private http: HttpClient) {
    this.jwtHelper = new JwtHelperService();
    this.authToken = null;
    this.user = null;
    this.loadToken();
    this.loadUser();
  }

  private loadToken(): void {
    const token = localStorage.getItem('token');
    this.authToken = token;
  }

  private loadUser(): void {
    if (this.authToken) {
      let userData = localStorage.getItem('user');
      if (userData) this.user = JSON.parse(userData);
      this.getProfile().subscribe({
        next: data => {
          this.user = data.user;
        },
        error: _ => {
          this.user = null;
        }
      });
    }
  }

  getUser(): User | null {
    return this.user;
  }

  // TODO:
  // getUserAndVerify(): User | null {
  //   if (this.loggedIn())
  //     return this.getUser()
  //   return null;
  // }

  checkUsername(username: string): Observable<AvailabilityResponse> {
    return this.http.get<AvailabilityResponse>(
      API_URL + 'users/checkUsername/' + username
    );
  }

  checkEmail(email: string): Observable<AvailabilityResponse> {
    return this.http.get<AvailabilityResponse>(
      API_URL + 'users/checkEmail/' + email
    );
  }

  registerUser(
    first_name: string,
    last_name: string,
    username: string,
    email: string,
    password: string
  ): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(API_URL + 'users/register', {
      first_name,
      last_name,
      username,
      email,
      password
    });
  }

  loginUser(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(API_URL + 'users/login', {
      username,
      password
    });
  }

  private storeToken(token: string): void {
    localStorage.setItem('token', token);
    this.authToken = token;
  }

  private storeUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.user = user;
  }

  saveUser(): void {
    if (this.user) localStorage.setItem('user', JSON.stringify(this.user));
  }

  setUserData(token: string, user: User): void {
    this.storeToken(token);
    this.storeUser(user);
  }

  updateUser(first_name: string, last_name: string, email: string) {
    if (this.user) {
      this.user.first_name = first_name;
      this.user.last_name = last_name;
      this.user.email = email;
      localStorage.setItem('user', JSON.stringify(this.user));
    }
  }

  loggedIn(): boolean {
    if (!this.authToken || this.jwtHelper.isTokenExpired(this.authToken))
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
    return this.http.post<AuthMessage>(API_URL + 'users/darkMode', { status });
  }

  setRoundIcons(status: boolean): Observable<AuthMessage> {
    return this.http.post<AuthMessage>(API_URL + 'users/roundIcons', {
      status
    });
  }

  getProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(API_URL + 'users/profile');
  }

  // TODO: Move to profile service
  updateProfile(
    first_name: string,
    last_name: string,
    email: string
  ): Observable<UpdateProfileResponse> {
    return this.http.put<UpdateProfileResponse>(API_URL + 'users/update', {
      first_name,
      last_name,
      email
    });
  }

  // TODO: Move to profile service
  // TODO: Return Observable<void>
  changePassword(
    old_password: string,
    new_password: string
  ): Observable<AuthMessage> {
    return this.http.post<AuthMessage>(API_URL + 'users/changePassword', {
      old_password,
      new_password
    });
  }

  // TODO: Move to profile service
  // TODO: Return Observable<void>
  uploadPhoto(photo: File): Observable<AuthMessage> {
    const formData = new FormData();
    formData.append('userPhoto', photo, photo.name);
    return this.http.post<AuthMessage>(API_URL + 'users/uploadPhoto', formData);
  }

  getUserProfile(username: string): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(API_URL + 'users/get/' + username);
  }

  addBookmark(id: string): Observable<void> {
    return this.http.put<void>(API_URL + 'users/bookmark/add', { id });
  }

  removeBookmark(id: string): Observable<void> {
    return this.http.put<void>(API_URL + 'users/bookmark/remove', { id });
  }
}
