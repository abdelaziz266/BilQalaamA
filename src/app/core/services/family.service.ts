import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ICreateFamily, IUpdateFamily } from '../models/family.dto';

@Injectable({
  providedIn: 'root'
})
export class FamilyService {
  private apiUrl = `${environment.apiUrl}Families/`;

  constructor(private http: HttpClient) { }

  getFamilies(pageNumber: number = 1, pageSize: number = 10): Observable<any> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<any>(`${this.apiUrl}get`, { params });
  }

  getFamiliesBySupervisor(
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


  getFamilyById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}get/${id}`);
  }

  createFamily(family: ICreateFamily): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}create`, family);
  }

  updateFamily(id: number, family: IUpdateFamily): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}update/${id}`, family);
  }

  deleteFamily(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}delete/${id}`);
  }
}
