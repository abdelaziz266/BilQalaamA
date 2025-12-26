import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { SelectModule } from 'primeng/select';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatSortModule, Sort } from '@angular/material/sort';
import { CustomPaginationComponent, PageChangeEvent } from '../../../../shared/components/custom-pagination/custom-pagination.component';
import { IGetSupervisor } from '../../../../core/models/supervisor.dto';
import { CurrencyOptions, CurrencyLabels } from '../../../../core/models/currency.enum';
import { SupervisorService } from '../../../../core/services/supervisor.service';
import { TokenService, UserRole } from '../../../../core/services/token.service';
import { SharedService } from '../../../../core/services/shared.service';
import { LoadingService } from '../../../../core/services/loading.service';
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
  isDataLoaded = false;
  supervisorForm!: FormGroup;
  selectedSupervisorId: number | null = null;
  isEditMode: boolean = false;
  currencyOptions = CurrencyOptions;
  currencyLabels = CurrencyLabels;
  passwordVisible: boolean = false;
  confirmPasswordVisible: boolean = false;

  getCurrencyLabel(currency: number): string {
    return (this.currencyLabels as any)[currency] || 'Unknown';
  }

  togglePasswordVisible(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleConfirmPasswordVisible(): void {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

  // Pagination
  rowCount = 10;
  pageNumber = 1;
  pagesCount = 0;
  totalCount = 0;

  constructor(
    private supervisorService: SupervisorService,
    private fb: FormBuilder,
    private tokenService: TokenService,
    private sharedService: SharedService,
    private loadingService: LoadingService,
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
      phoneNumber: ['', [Validators.required, Validators.pattern(/^01[012][0-9]{8}$/)]],
      password: [null, this.isEditMode ? [] : [Validators.required]],
      confirmPassword: ['', this.isEditMode ? [] : [Validators.required]],
      hourlyRate: [0, [Validators.required, Validators.min(0.01)]],
      currency: [1, Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else if (confirmPassword) {
      const errors = confirmPassword.errors;
      if (errors) {
        delete errors['passwordMismatch'];
        if (Object.keys(errors).length === 0) {
          confirmPassword.setErrors(null);
        } else {
          confirmPassword.setErrors(errors);
        }
      }
    }
    return null;
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

  get confirmPassword() {
    return this.supervisorForm.get('confirmPassword')!;
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
    this.loadingService.show();
    this.supervisorService.GetSupervisors(this.pageNumber=1, this.rowCount=10).subscribe({
      next: (res) => {
        if (res.status === 200) {
          this.supervisors = res.data.items;
          this.pagesCount = res.data.pagesCount;
          this.totalCount = res.data.totalCount;
        }
        this.isDataLoaded = true;
        this.loadingService.hide();
      },
      error: (err) => {
        this.isDataLoaded = true;
        this.loadingService.hide();
        const errorMsg = err.error?.errors?.[0] || err.error?.message || err.message || 'حدث خطأ ما';
        this.toastr.error(errorMsg);
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
    this.passwordVisible = false;
    this.confirmPasswordVisible = false;
    this.supervisorForm.reset({
      fullName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      hourlyRate: 0,
      currency: 1
    });
    
    // Restore validators for Add mode
    this.supervisorForm.get('password')?.setValidators([Validators.required]);
    this.supervisorForm.get('password')?.updateValueAndValidity();
    this.supervisorForm.get('confirmPassword')?.setValidators([Validators.required]);
    this.supervisorForm.get('confirmPassword')?.updateValueAndValidity();
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
        password: '',
        confirmPassword: ''
      });
      // Password is not required when editing
      this.supervisorForm.get('password')?.setValidators([]);
      this.supervisorForm.get('password')?.updateValueAndValidity();
      this.supervisorForm.get('confirmPassword')?.setValidators([]);
      this.supervisorForm.get('confirmPassword')?.updateValueAndValidity();
    }
  }

  openDeleteModal(id: number): void {
    this.selectedSupervisorId = id;
  }

  submitForm(): void {
    if (this.supervisorForm.invalid) {
      this.supervisorForm.markAllAsTouched();
      return;
    }

    const { confirmPassword, ...data } = this.supervisorForm.value;
    if (this.isEditMode && this.selectedSupervisorId) {
      if (data.password === null || data.password === '') 
        delete data.password;
      this.supervisorService.updateSupervisor(this.selectedSupervisorId, { ...data, id: this.selectedSupervisorId }).subscribe({
        next: (res) => {
          this.toastr.success(res.message);
          this.getSupervisors();
          this.closeOffcanvas();
        },
        error: (err) => {
          
          const errorMsg = err.error?.errors?.[0] || err.error?.message || err.message || 'حدث خطأ ما';
          this.toastr.error(errorMsg);
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
          const errorMsg = err.error?.errors?.[0] || err.error?.message || err.message || 'حدث خطأ ما';
          this.toastr.error(errorMsg);
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
          const errorMsg = err.error?.errors?.[0] || err.error?.message || err.message || 'حدث خطأ ما';
          this.toastr.error(errorMsg);
        }
      });
    }
  }

  sortData(sort: Sort): void {
    // Implement sorting if needed
  }

  isSuperAdmin(): boolean {
    return this.tokenService.getUserRole() === UserRole.SuperAdmin;
  }
}
