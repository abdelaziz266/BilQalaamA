import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';

export interface DashboardDto {
  supervisorsCount: number;
  teachersCount: number;
  familiesCount: number;
  studentsCount: number;
  totalLessonsCount: number;
  currentMonthLessonsCount: number;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  statusCode: number;
  isSuccess: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = environment.apiUrl + 'Dashboard/';

  constructor(private http: HttpClient) { }

  /**
   * احصل على جميع إحصائيات لوحة البيانات من الـ endpoint الرئيسي
   */
  getDashboardStats(): Observable<DashboardDto> {
    return this.http.get<ApiResponse<DashboardDto>>(`${this.apiUrl}statistics`).pipe(
      map((response: ApiResponse<DashboardDto>) => {
        return response.data;
      })
    );
  }
}
