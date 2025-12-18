import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { SharedService } from '../../../../core/services/shared.service';
import { ServiceCategoryService } from '../../../../core/services/service-category.service';
import { IApiResponseWithList } from '../../../../core/models/shared.dto';
import { IGetServiceCompany } from '../../../../core/models/serviceCategory.dto';
import { routes } from '../../../../shared/routes/routes';

@Component({
  selector: 'app-get-service-companies',
  standalone: true,
  imports: [CommonModule, DragDropModule, RouterLink],
  templateUrl: './get-service-companies.component.html',
  styleUrl: './get-service-companies.component.scss'
})
export class GetServiceCompaniesComponent implements OnInit {
  serviceId: any;
  getServiceCompany: IGetServiceCompany[] = [];
  routes = routes;

  constructor(
    private route: ActivatedRoute, 
    private serviceCategoryService: ServiceCategoryService, 
    private sharedService: SharedService
  ) { }

  ngOnInit() {
    this.serviceId = this.route.snapshot.paramMap.get('serviceId');
    this.GetServiceCategories();
  }

  GetServiceCategories(): void {
    const observer = {
      next: (res: IApiResponseWithList<IGetServiceCompany[]>) => {
        this.getServiceCompany = res.data?.data || [];
        // Add order property if not exists
        this.getServiceCompany.forEach((company, index) => {
            (company as any).order = index + 1;
        });
      },
      error: (err: any) => {
        this.sharedService.handleError(err);
      },
    };
    this.serviceCategoryService.GetServiceCompanies(this.serviceId).subscribe(observer);
  }

  drop(event: CdkDragDrop<IGetServiceCompany[]>): void {
    if ((event.previousIndex !== event.currentIndex) && (event.previousIndex > event.currentIndex)) {
      const company = this.getServiceCompany[event.previousIndex];
      this.getServiceCompany.splice(event.previousIndex, 1);
      this.getServiceCompany.splice(event.currentIndex, 0, company);
      this.updateCompanyOrder();
    }
  }

  private updateCompanyOrder(): void {
    this.getServiceCompany.forEach((company, index) => {
      (company as any).order = index + 1;
    });
  }

  accessCompany(company: IGetServiceCompany): void {
    // Navigate to company details with the company ID
    console.log('Access company:', company);
    // this.router.navigate([routes.companiesCard, company.id]);
  }
}
