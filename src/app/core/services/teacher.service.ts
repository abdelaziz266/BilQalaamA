import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient, HttpParams } from '@angular/common/http';
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
  getTeavhersBySupervisors(
  supervisorIds: number[],
  pageNumber: number = 1,
  pageSize: number = 10000
): Observable<any> {
  let params = new HttpParams()
    .set('pageNumber', pageNumber.toString())
    .set('pageSize', pageSize.toString());

  supervisorIds.forEach(id => {
    params = params.append('supervisorIds', id.toString());
  });

  return this.http.get<any>(
    `${this.apiUrl}by-supervisors`,
    { params }
  );
}

  getTeachersByFamily(familyId: number, pageNumber: number = 1, pageSize: number = 10000): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}by-family/${familyId}`, {
      params: {
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString()
      }
    });
  }
}
