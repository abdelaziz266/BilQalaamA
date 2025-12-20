import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { SelectModule } from 'primeng/select';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatSortModule, Sort } from '@angular/material/sort';
import { CustomPaginationComponent, PageChangeEvent } from '../../../../shared/components/custom-pagination/custom-pagination.component';
import { IGetSupervisor, IAddSupervisor, IUpdateSupervisor } from '../../../../core/models/supervisor.dto';
import { CurrencyOptions, CurrencyLabels } from '../../../../core/models/currency.enum';
import { SupervisorService } from '../../../../core/services/supervisor.service';
import { SharedService } from '../../../../core/services/shared.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-supervisors-home',
  standalone: true,
  imports: [ReactiveFormsModule, SelectModule, FormsModule, CommonModule, RouterLink, CustomPaginationComponent, MatSortModule],
  templateUrl: './supervisors-home.component.html',
  styleUrl: './supervisors-home.component.scss'
})
export class SupervisorsHomeComponent implements OnInit, AfterViewInit {
  @ViewChild('offcanvasAdd', { static: false }) offcanvasAdd!: ElementRef;
  @ViewChild('offcanvasEdit', { static: false }) offcanvasEdit!: ElementRef;

  supervisors: IGetSupervisor[] = [];
  supervisorForm!: FormGroup;
  selectedSupervisorId: number | null = null;
  isEditMode: boolean = false;
  currencyOptions = CurrencyOptions;
  currencyLabels = CurrencyLabels;

  getCurrencyLabel(currency: number): string {
    return (this.currencyLabels as any)[currency] || 'Unknown';
  }

  // Pagination
  rowCount = 10;
  pageNumber = 1;
  pagesCount = 0;
  totalCount = 0;

  constructor(
    private supervisorService: SupervisorService,
    private fb: FormBuilder,
    private sharedService: SharedService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.getSupervisors();
    this.initForm();
  }

  initForm(): void {
    this.supervisorForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.com$/)]],
      phoneNumber: ['', [Validators.required, Validators.minLength(11), Validators.maxLength(11)]],
      password: ['', this.isEditMode ? [] : [Validators.required]],
      hourlyRate: [0, [Validators.required, Validators.min(0)]],
      currency: [1, Validators.required]
    });
  }

  get fullName() {
    return this.supervisorForm.get('fullName')!;
  }

  get email() {
    return this.supervisorForm.get('email')!;
  }

  get phoneNumber() {
    return this.supervisorForm.get('phoneNumber')!;
  }

  get password() {
    return this.supervisorForm.get('password')!;
  }

  get hourlyRate() {
    return this.supervisorForm.get('hourlyRate')!;
  }

  get currency() {
    return this.supervisorForm.get('currency')!;
  }

  ngAfterViewInit(): void {
    if (this.offcanvasAdd && this.offcanvasAdd.nativeElement) {
      this.offcanvasAdd.nativeElement.addEventListener('hidden.bs.offcanvas', () => {
        this.resetForm();
      });
    }

    if (this.offcanvasEdit && this.offcanvasEdit.nativeElement) {
      this.offcanvasEdit.nativeElement.addEventListener('hidden.bs.offcanvas', () => {
        this.resetForm();
      });
    }
  }

  getSupervisors(): void {
    this.supervisorService.GetSupervisors(this.pageNumber=1, this.rowCount=10).subscribe({
      next: (res) => {
        debugger
        if (res.status === 200) {
          this.supervisors = res.data.items;
          this.pagesCount = res.data.pagesCount;
          this.totalCount = res.data.totalCount;
        }
      },
      error: (err) => {
        debugger
        this.toastr.error(err.message);
      }
    });
  }

  onPageChange(event: PageChangeEvent): void {
    this.pageNumber = event.pageNumber;
    this.rowCount = event.rowCount;
    this.getSupervisors();
  }

  resetForm(): void {
    this.isEditMode = false;
    this.selectedSupervisorId = null;
    this.supervisorForm.reset({
      fullName: '',
      email: '',
      phoneNumber: '',
      password: '',
      hourlyRate: 0,
      currency: 1
    });
  }

  openEditModal(id: number): void {
    this.isEditMode = true;
    this.selectedSupervisorId = id;
    const supervisor = this.supervisors.find(s => s.id === id);
    if (supervisor) {
      this.supervisorForm.patchValue({
        fullName: supervisor.supervisorName,
        email: supervisor.email,
        phoneNumber: supervisor.phoneNumber,
        hourlyRate: supervisor.hourlyRate,
        currency: supervisor.currency,
        password: '' // Password usually not returned or edited this way
      });
      // Password is not required when editing
      this.supervisorForm.get('password')?.setValidators([]);
      this.supervisorForm.get('password')?.updateValueAndValidity();
    }
  }

  openDeleteModal(id: number): void {
    this.selectedSupervisorId = id;
  }

  submitForm(): void {
    debugger;
    if (this.supervisorForm.invalid) {
      this.supervisorForm.markAllAsTouched();
      return;
    }

    const data = this.supervisorForm.value;
    if (this.isEditMode && this.selectedSupervisorId) {
      this.supervisorService.updateSupervisor(this.selectedSupervisorId, { ...data, id: this.selectedSupervisorId }).subscribe({
        next: (res) => {
          this.toastr.success(res.message);
          this.getSupervisors();
          this.closeOffcanvas();
        },
        error: (err) => {
          this.toastr.error(err.message);
        }
      });
    } else {
      this.supervisorService.createSupervisor(data).subscribe({
        next: (res) => {
          this.toastr.success(res.message);
          this.getSupervisors();
          this.closeOffcanvas();
        },
        error: (err) => {
          this.toastr.error(err.message);
        }
      });
    }
  }

  closeOffcanvas(): void {
    const offcanvasAdd = this.offcanvasAdd.nativeElement;
    const offcanvasEdit = this.offcanvasEdit.nativeElement;
    (window as any).bootstrap?.Offcanvas.getOrCreateInstance(offcanvasAdd)?.hide();
    (window as any).bootstrap?.Offcanvas.getOrCreateInstance(offcanvasEdit)?.hide();
  }

  onDeleteSupervisor(): void {
    if (this.selectedSupervisorId) {
      this.supervisorService.deleteSupervisor(this.selectedSupervisorId).subscribe({
        next: (res) => {
          this.toastr.success(res.message);
          this.getSupervisors();
        },
        error: (err) => {
          this.toastr.error(err.message);
        }
      });
    }
  }

  sortData(sort: Sort): void {
    // Implement sorting if needed
  }
}
