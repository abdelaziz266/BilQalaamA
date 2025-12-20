import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IAddSupervisor, IUpdateSupervisor } from '../models/supervisor.dto';

@Injectable({
  providedIn: 'root'
})
export class SupervisorService {
  private apiUrl = environment.apiUrl + 'Supervisors/';

  constructor(private http: HttpClient) { }
  
  GetSupervisorById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}get/${id}`);
  }

  GetSupervisors(pageNumber: number = 1, pageSize: number = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}get`, {
      params: {
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString()
      }
    });
  }

  createSupervisor(supervisorData: IAddSupervisor): Observable<any> {
    return this.http.post(`${this.apiUrl}create`, supervisorData);
  }

  updateSupervisor(id: number, supervisorData: IUpdateSupervisor): Observable<any> {
    return this.http.put(`${this.apiUrl}update/${id}`, supervisorData);
  }

  deleteSupervisor(supervisorId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}delete/${supervisorId}`);
  }
}
