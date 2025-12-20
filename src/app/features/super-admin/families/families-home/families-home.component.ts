import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { SelectModule } from 'primeng/select';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatSortModule, Sort } from '@angular/material/sort';
import { CustomPaginationComponent, PageChangeEvent } from '../../../../shared/components/custom-pagination/custom-pagination.component';
import { IFamilyResponse } from '../../../../core/models/family.dto';
import { IGetSupervisor } from '../../../../core/models/supervisor.dto';
import { CurrencyOptions, CurrencyLabels } from '../../../../core/models/currency.enum';
import { FamilyService } from '../../../../core/services/family.service';
import { SupervisorService } from '../../../../core/services/supervisor.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-families-home',
  standalone: true,
  imports: [ReactiveFormsModule, SelectModule, FormsModule, CommonModule, RouterLink, CustomPaginationComponent, MatSortModule],
  templateUrl: './families-home.component.html',
  styleUrls: ['./families-home.component.scss']
})
export class FamiliesHomeComponent implements OnInit, AfterViewInit {
  @ViewChild('offcanvasAdd', { static: false }) offcanvasAdd!: ElementRef;
  @ViewChild('offcanvasEdit', { static: false }) offcanvasEdit!: ElementRef;

  families: IFamilyResponse[] = [];
  supervisors: IGetSupervisor[] = [];
  totalCount = 0;
  rowCount = 10;
  pageNumber = 1;
  pagesCount = 0;

  familyForm: FormGroup;
  isEditMode = false;
  selectedFamilyId: number | null = null;

  passwordVisible = false;
  confirmPasswordVisible = false;

  currencyOptions = CurrencyOptions;

  constructor(
    private fb: FormBuilder,
    private familyService: FamilyService,
    private supervisorService: SupervisorService,
    private toastr: ToastrService
  ) {
    this.familyForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.com$/)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^01[012][0-9]{8}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      country: ['', [Validators.required, Validators.minLength(2)]],
      supervisorId: [null],
      hourlyRate: [0, [Validators.required, Validators.min(0.01)]],
      currency: [0, [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.loadFamilies();
    this.loadSupervisors();
  }

  ngAfterViewInit(): void {
    this.setupOffcanvasListeners();
  }

  setupOffcanvasListeners(): void {
    const addEl = this.offcanvasAdd?.nativeElement;
    const editEl = this.offcanvasEdit?.nativeElement;

    if (addEl) {
      addEl.addEventListener('hidden.bs.offcanvas', () => this.resetForm());
    }
    if (editEl) {
      editEl.addEventListener('hidden.bs.offcanvas', () => this.resetForm());
    }
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

  loadFamilies(): void {
    this.familyService.getFamilies(this.pageNumber, this.rowCount).subscribe({
      next: (res) => {
          this.families = res.data.items;
          
          this.totalCount = res.data.totalCount;
          this.pagesCount = res.data.pagesCount;
      },
      error: (err) => this.handleError(err)
    });
  }

  loadSupervisors(): void {
    this.supervisorService.GetSupervisors(1, 1000).subscribe({
      next: (res: any) => {
        this.supervisors = res.data.items;
      }
    });
  }

  onPageChange(event: PageChangeEvent): void {
    this.pageNumber = event.pageNumber;
    this.rowCount = event.rowCount;
    this.loadFamilies();
  }

  sortData(sort: Sort): void {
    // Implementation for sorting if needed
  }

  togglePasswordVisible(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleConfirmPasswordVisible(): void {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

  resetForm(): void {
    this.isEditMode = false;
    this.selectedFamilyId = null;
    this.familyForm.reset({
      hourlyRate: 0,
      currency: 0
    });
    this.familyForm.get('email')?.enable();
    this.familyForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.familyForm.get('confirmPassword')?.setValidators([Validators.required]);
    this.familyForm.updateValueAndValidity();
  }

  openEditModal(id: number): void {
    this.isEditMode = true;
    this.selectedFamilyId = id;
    this.familyService.getFamilyById(id).subscribe({
      next: (res) => {
          const family = res.data;
          this.familyForm.patchValue({
            fullName: family.familyName,
            email: family.email,
            phoneNumber: family.phoneNumber,
            country: family.country,
            supervisorId: family.supervisorId,
            hourlyRate: family.hourlyRate,
            currency: family.currency,
            password: '',
            confirmPassword: ''
          });
          this.familyForm.get('password')?.setValidators([]);
      this.familyForm.get('password')?.updateValueAndValidity();
      this.familyForm.get('confirmPassword')?.setValidators([]);
      this.familyForm.get('confirmPassword')?.updateValueAndValidity();
      },
      error: (err) => this.handleError(err)
    });
  }

  submitForm(): void {
    if (this.familyForm.invalid) {
      this.familyForm.markAllAsTouched();
      return;
    }

    const formData = this.familyForm.getRawValue();
    if (this.isEditMode && this.selectedFamilyId) {
      const updateData = { ...formData };
      if (!updateData.password) delete updateData.password;
      delete updateData.confirmPassword;

      this.familyService.updateFamily(this.selectedFamilyId, updateData).subscribe({
        next: (res) => {
          this.toastr.success(res.message);
            this.loadFamilies();
            this.closeOffcanvas('offcanvas_edit');
        },
        error: (err) => this.handleError(err)
      });
    } else {
      const createData = { ...formData };
      delete createData.confirmPassword;

      this.familyService.createFamily(createData).subscribe({
        next: (res) => {
          this.toastr.success(res.message);
            this.loadFamilies();
            this.closeOffcanvas('offcanvas_add');
        },
        error: (err) => this.handleError(err)
      });
    }
  }

  openDeleteModal(id: number): void {
    this.selectedFamilyId = id;
  }

  onDeleteFamily(): void {
    if (this.selectedFamilyId) {
      this.familyService.deleteFamily(this.selectedFamilyId).subscribe({
        next: (res) => {
          this.toastr.success(res.message);
            this.loadFamilies();
        },
        error: (err) => this.handleError(err)
      });
    }
  }

  private closeOffcanvas(id: string): void {
    const element = document.getElementById(id);
    if (element) {
      const bsOffcanvas = (window as any).bootstrap.Offcanvas.getInstance(element);
      bsOffcanvas?.hide();
    }
  }

  private handleError(err: any): void {
    const message = err.error?.errors?.[0] || err.error?.message || 'حدث خطأ ما';
    this.toastr.error(message);
  }

  getCurrencyLabel(value: number): string {
    return CurrencyLabels[value as keyof typeof CurrencyLabels] || '';
  }

  get fullName() { return this.familyForm.get('fullName')!; }
  get email() { return this.familyForm.get('email')!; }
  get phoneNumber() { return this.familyForm.get('phoneNumber')!; }
  get password() { return this.familyForm.get('password')!; }
  get confirmPassword() { return this.familyForm.get('confirmPassword')!; }
  get country() { return this.familyForm.get('country')!; }
  get hourlyRate() { return this.familyForm.get('hourlyRate')!; }
  get currency() { return this.familyForm.get('currency')!; }
}
