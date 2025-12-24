import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { SelectModule } from 'primeng/select';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatSortModule, Sort } from '@angular/material/sort';
import { CustomPaginationComponent, PageChangeEvent } from '../../../../shared/components/custom-pagination/custom-pagination.component';
import { ITeacherResponse } from '../../../../core/models/teacher.dto';
import { IGetSupervisor } from '../../../../core/models/supervisor.dto';
import { CurrencyOptions, CurrencyLabels } from '../../../../core/models/currency.enum';
import { TeacherService } from '../../../../core/services/teacher.service';
import { SupervisorService } from '../../../../core/services/supervisor.service';
import { TokenService, UserRole } from '../../../../core/services/token.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-teachers-home',
  standalone: true,
  imports: [ReactiveFormsModule, SelectModule, FormsModule, CommonModule, RouterLink, CustomPaginationComponent, MatSortModule],
  templateUrl: './teachers-home.component.html',
  styleUrls: ['./teachers-home.component.scss']
})
export class TeachersHomeComponent implements OnInit, AfterViewInit {
  @ViewChild('offcanvasAdd', { static: false }) offcanvasAdd!: ElementRef;
  @ViewChild('offcanvasEdit', { static: false }) offcanvasEdit!: ElementRef;

  teachers: ITeacherResponse[] = [];
  supervisors: IGetSupervisor[] = [];
  teacherForm!: FormGroup;
  selectedTeacherId: number | null = null;
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
    private teacherService: TeacherService,
    private supervisorService: SupervisorService,
    private fb: FormBuilder,
    private tokenService: TokenService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.getTeachers();
    this.getSupervisors();
    this.initForm();
  }

  initForm(): void {
    this.teacherForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.com$/)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^01[012][0-9]{8}$/)]],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', this.isEditMode ? [] : [Validators.required]],
      supervisorId: [null],
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

  // Getters for form controls
  get fullName() { return this.teacherForm.get('fullName')!; }
  get email() { return this.teacherForm.get('email')!; }
  get phoneNumber() { return this.teacherForm.get('phoneNumber')!; }
  get password() { return this.teacherForm.get('password')!; }
  get confirmPassword() { return this.teacherForm.get('confirmPassword')!; }
  get hourlyRate() { return this.teacherForm.get('hourlyRate')!; }
  get currency() { return this.teacherForm.get('currency')!; }
  get supervisorId() { return this.teacherForm.get('supervisorId')!; }

  ngAfterViewInit(): void {
    if (this.offcanvasAdd?.nativeElement) {
      this.offcanvasAdd.nativeElement.addEventListener('hidden.bs.offcanvas', () => this.resetForm());
    }
    if (this.offcanvasEdit?.nativeElement) {
      this.offcanvasEdit.nativeElement.addEventListener('hidden.bs.offcanvas', () => this.resetForm());
    }
  }

  getTeachers(): void {
    this.teacherService.getTeachers(this.pageNumber, this.rowCount).subscribe({
      next: (res) => {
        if (res.status === 200) {
          this.teachers = res.data.items;
          this.pagesCount = res.data.pagesCount;
          this.totalCount = res.data.totalCount;
        }
      },
      error: (err) => this.handleError(err)
    });
  }

  getSupervisors(): void {
    // Fetching a large number to get all supervisors for the dropdown
    this.supervisorService.GetSupervisors(1, 1000).subscribe({
      next: (res) => {
        if (res.status === 200) {
          this.supervisors = res.data.items;
        }
      }
    });
  }

  onPageChange(event: PageChangeEvent): void {
    this.pageNumber = event.pageNumber;
    this.rowCount = event.rowCount;
    this.getTeachers();
  }

  resetForm(): void {
    this.isEditMode = false;
    this.selectedTeacherId = null;
    this.passwordVisible = false;
    this.confirmPasswordVisible = false;
    this.teacherForm.reset({
      fullName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      supervisorId: null,
      hourlyRate: 0,
      currency: 1
    });
    
    this.teacherForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.teacherForm.get('password')?.updateValueAndValidity();
    this.teacherForm.get('confirmPassword')?.setValidators([Validators.required]);
    this.teacherForm.get('confirmPassword')?.updateValueAndValidity();
  }

  openEditModal(id: number): void {
    this.isEditMode = true;
    this.selectedTeacherId = id;
    const teacher = this.teachers.find(t => t.id === id);
    if (teacher) {
      this.teacherForm.patchValue({
        fullName: teacher.teacherName,
        email: teacher.email,
        phoneNumber: teacher.phoneNumber,
        supervisorId: teacher.supervisorId,
        hourlyRate: teacher.hourlyRate,
        currency: teacher.currency,
        password: '',
        confirmPassword: ''
      });
      this.teacherForm.get('password')?.setValidators([Validators.minLength(6)]);
      this.teacherForm.get('password')?.updateValueAndValidity();
      this.teacherForm.get('confirmPassword')?.setValidators([]);
      this.teacherForm.get('confirmPassword')?.updateValueAndValidity();
    }
  }

  openDeleteModal(id: number): void {
    this.selectedTeacherId = id;
  }

  submitForm(): void {
    if (this.teacherForm.invalid) {
      this.teacherForm.markAllAsTouched();
      return;
    }

    const { confirmPassword, ...data } = this.teacherForm.value;
    
    // إذا لم يكن مشرف عام، لا نرسل supervisorId لأن الـ backend سيتعامل معه
    if (!this.isSuperAdmin()) {
      delete data.supervisorId;
    }

    if (this.isEditMode && this.selectedTeacherId) {
      if (!data.password) delete data.password;
      this.teacherService.updateTeacher(this.selectedTeacherId, { ...data, id: this.selectedTeacherId }).subscribe({
        next: (res) => {
          this.toastr.success(res.message);
          this.getTeachers();
          this.closeOffcanvas();
        },
        error: (err) => this.handleError(err)
      });
    } else {
      this.teacherService.createTeacher(data).subscribe({
        next: (res) => {
          this.toastr.success(res.message);
          this.getTeachers();
          this.closeOffcanvas();
        },
        error: (err) => this.handleError(err)
      });
    }
  }

  closeOffcanvas(): void {
    const offcanvasAdd = this.offcanvasAdd.nativeElement;
    const offcanvasEdit = this.offcanvasEdit.nativeElement;
    (window as any).bootstrap?.Offcanvas.getOrCreateInstance(offcanvasAdd)?.hide();
    (window as any).bootstrap?.Offcanvas.getOrCreateInstance(offcanvasEdit)?.hide();
  }

  onDeleteTeacher(): void {
    if (this.selectedTeacherId) {
      this.teacherService.deleteTeacher(this.selectedTeacherId).subscribe({
        next: (res) => {
          this.toastr.success(res.message);
          this.getTeachers();
        },
        error: (err) => this.handleError(err)
      });
    }
  }

  private handleError(err: any): void {
    const errorMsg = err.error?.errors?.[0] || err.error?.message || err.message || 'حدث خطأ ما';
    this.toastr.error(errorMsg);
  }

  sortData(sort: Sort): void {
    // Implement sorting if needed
  }

  isSuperAdmin(): boolean {
    return this.tokenService.getUserRole() === UserRole.SuperAdmin;
  }
}
