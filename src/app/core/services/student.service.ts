import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ICreateStudent, IUpdateStudent } from '../models/student.dto';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = `${environment.apiUrl}Students/`;

  constructor(private http: HttpClient) { }

 getStudents(
  pageNumber: number = 1,
  pageSize: number = 10,
  familyIds?: number[],
  teacherIds?: number[]
): Observable<any> {
  let params = new HttpParams()
    .set('pageNumber', pageNumber.toString())
    .set('pageSize', pageSize.toString());

  if (familyIds?.length) {
    familyIds.forEach(id => {
      params = params.append('familyIds', id.toString()); // ✅ الاسم الصح
    });
  }

  if (teacherIds?.length) {
    teacherIds.forEach(id => {
      params = params.append('teacherIds', id.toString()); // ✅ الاسم الصح
    });
  }

  return this.http.get<any>(`${this.apiUrl}get`, { params });
}
getStudentsByFamilies(
  familyIds: number[],
  pageNumber: number = 1,
  pageSize: number = 10000
): Observable<any> {
  let params = new HttpParams()
    .set('pageNumber', pageNumber.toString())
    .set('pageSize', pageSize.toString());

  familyIds.forEach(id => {
    params = params.append('familyIds', id.toString());
  });

  return this.http.get<any>(
    `${this.apiUrl}by-families`,
    { params }
  );
}


  getStudentById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}get/${id}`);
  }


  createStudent(student: ICreateStudent): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}create`, student);
  }

  updateStudent(id: number, student: IUpdateStudent): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}update/${id}`, student);
  }

  deleteStudent(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}delete/${id}`);
  }

  getStudentsByTeachers(
    teacherIds: number[],
    pageNumber: number = 1,
    pageSize: number = 10000
  ): Observable<any> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    teacherIds.forEach(id => {
      params = params.append('teacherIds', id.toString());
    });

    return this.http.get<any>(
      `${this.apiUrl}by-teachers`,
      { params }
    );
  }
  
  getByTeacherId(teacherId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}by-teacher/${teacherId}`);
  }
}
