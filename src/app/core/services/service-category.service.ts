import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { IApiResponse, IApiResponseWithList } from '../models/shared.dto';
import { Observable } from 'rxjs';
import { IGetServiceCategoryDto, IGetServiceCompany } from '../models/serviceCategory.dto';

@Injectable({
  providedIn: 'root'
})
export class ServiceCategoryService {
  private apiUrl = environment.apiUrl + 'ServiceCategory/';
  
    constructor(private http: HttpClient) {}
  
    GetServiceCategories(): Observable<IApiResponse<IGetServiceCategoryDto[]>> {
      return this.http.get<IApiResponse<IGetServiceCategoryDto[]>>(
        `${this.apiUrl}GetServiceCategories`
      );
    }
    GetServiceCompanies(serviceId:number): Observable<IApiResponseWithList<IGetServiceCompany[]>> {
    return this.http.get<IApiResponseWithList<IGetServiceCompany[]>>(
      `${environment.apiUrlBtakka}ServiceCategory/GetServiceCompanies?serviceId=${serviceId}`
    );
  }
}
