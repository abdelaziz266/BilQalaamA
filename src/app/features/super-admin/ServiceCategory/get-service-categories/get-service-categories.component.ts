import { Component, OnInit } from '@angular/core';
import { ServiceCategoryService } from '../../../../core/services/service-category.service';
import { SharedService } from '../../../../core/services/shared.service';
import { Router } from '@angular/router';
import { IApiResponse } from '../../../../core/models/shared.dto';
import { IGetServiceCategoryDto } from '../../../../core/models/serviceCategory.dto';
import { routes } from '../../../../shared/routes/routes';
import { ro } from 'intl-tel-input/i18n';

@Component({
  selector: 'app-get-service-categories',
  templateUrl: './get-service-categories.component.html',
  styleUrl: './get-service-categories.component.scss'
})
export class GetServiceCategoriesComponent implements  OnInit {
  getServiceCategoryDto: IGetServiceCategoryDto[] = [];
  routes = routes;
  constructor(private serviceCategoryService: ServiceCategoryService, private sharedService: SharedService, private router: Router) { };
  ngOnInit(): void {
    this.GetServiceCategories();
  }
  GetServiceCategories(): void {
    const observer = {
      next: (res: IApiResponse<IGetServiceCategoryDto[]>) => {
        this.getServiceCategoryDto = res.data||[];
      },
      error: (err: any) => {
        this.sharedService.handleError(err);
      },
    };
    this.serviceCategoryService.GetServiceCategories().subscribe(observer);
  }

  openServiceUnits(id: string) {
    this.router.navigate([routes.serviceCompanies, id]);
  }
}
