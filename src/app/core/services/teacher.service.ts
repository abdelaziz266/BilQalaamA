import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ICreateTeacher, IUpdateTeacher } from '../models/teacher.dto';

@Injectable({
  providedIn: 'root'
})
export class TeacherService {
  private apiUrl = environment.apiUrl + 'Teachers/';

  constructor(private http: HttpClient) { }
  
  getTeacherById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}get/${id}`);
  }

  getTeachers(pageNumber: number = 1, pageSize: number = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}get`, {
      params: {
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString()
      }
    });
  }

  createTeacher(teacherData: ICreateTeacher): Observable<any> {
    return this.http.post(`${this.apiUrl}create`, teacherData);
  }

  updateTeacher(id: number, teacherData: IUpdateTeacher): Observable<any> {
    return this.http.put(`${this.apiUrl}update/${id}`, teacherData);
  }

  deleteTeacher(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}delete/${id}`);
  }
}
