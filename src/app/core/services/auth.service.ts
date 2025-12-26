import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ILogin } from '../models/auth.dto';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl + 'Auth/';

  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<any> {
    const body: ILogin = {
      email,
      password
    };
    return this.http.post(`${this.apiUrl}login`, body);
  }

}
