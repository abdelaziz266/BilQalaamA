import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ICreateLesson, IUpdateLesson } from '../models/lesson.dto';

@Injectable({
  providedIn: 'root'
})
export class LessonService {
  private apiUrl = `${environment.apiUrl}Lessons/`;

  constructor(private http: HttpClient) { }

  getLessons(
    pageNumber: number = 1, 
    pageSize: number = 10,
    supervisorIds?: number[],
    teacherIds?: number[],
    studentIds?: number[],
    familyIds?: number[],
    fromDate?: string,
    toDate?: string
  ): Observable<any> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
    
    if (supervisorIds && supervisorIds.length > 0) {
      supervisorIds.forEach(id => {
        params = params.append('supervisorIds', id.toString());
      });
    }
    if (teacherIds && teacherIds.length > 0) {
      teacherIds.forEach(id => {
        params = params.append('teacherIds', id.toString());
      });
    }
    if (studentIds && studentIds.length > 0) {
      studentIds.forEach(id => {
        params = params.append('studentIds', id.toString());
      });
    }
    if (familyIds && familyIds.length > 0) {
      familyIds.forEach(id => {
        params = params.append('familyIds', id.toString());
      });
    }
    if (fromDate) {
      params = params.set('fromDate', fromDate);
    }
    if (toDate) {
      params = params.set('toDate', toDate);
    }
    
    return this.http.get<any>(`${this.apiUrl}get`, { params });
  }

  getLessonById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}get/${id}`);
  }

  getLessonsByTeacher(teacherId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}ByTeacher/${teacherId}`);
  }

  getLessonsByFamily(familyId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}ByFamily/${familyId}`);
  }

  getLessonsByStudent(studentId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}ByStudent/${studentId}`);
  }

  getLessonsByDateRange(fromDate: string, toDate: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}ByDateRange`, {
      params: { fromDate, toDate }
    });
  }

  createLesson(lesson: ICreateLesson): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}create`, lesson);
  }

  updateLesson(id: number, lesson: IUpdateLesson): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}update/${id}`, lesson);
  }

  deleteLesson(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}delete/${id}`);
  }
}
    );
  }
}
