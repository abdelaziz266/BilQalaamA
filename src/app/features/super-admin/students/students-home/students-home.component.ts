import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatSortModule, Sort } from '@angular/material/sort';
import { CustomPaginationComponent, PageChangeEvent } from '../../../../shared/components/custom-pagination/custom-pagination.component';
import { IStudentResponse } from '../../../../core/models/student.dto';
import { IFamilyResponse } from '../../../../core/models/family.dto';
import { ITeacherResponse } from '../../../../core/models/teacher.dto';
import { CurrencyOptions, CurrencyLabels } from '../../../../core/models/currency.enum';
import { StudentService } from '../../../../core/services/student.service';
import { FamilyService } from '../../../../core/services/family.service';
import { TeacherService } from '../../../../core/services/teacher.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-students-home',
  standalone: true,
  imports: [ReactiveFormsModule, SelectModule, MultiSelectModule, FormsModule, CommonModule, RouterLink, CustomPaginationComponent, MatSortModule],
  templateUrl: './students-home.component.html',
  styleUrls: ['./students-home.component.scss']
})
export class StudentsHomeComponent implements OnInit, AfterViewInit {
  @ViewChild('offcanvasAdd', { static: false }) offcanvasAdd!: ElementRef;
  @ViewChild('offcanvasEdit', { static: false }) offcanvasEdit!: ElementRef;

  students: IStudentResponse[] = [];
  families: IFamilyResponse[] = [];
  teachers: ITeacherResponse[] = [];
  totalCount = 0;
  rowCount = 10;
  pageNumber = 1;
  pagesCount = 0;

  studentForm: FormGroup;
  isEditMode = false;
  selectedStudentId: number | null = null;

  passwordVisible = false;
  confirmPasswordVisible = false;

  currencyOptions = CurrencyOptions;

  // Filters
  selectedFamilyIds: number[] = [];
  selectedTeacherIds: number[] = [];

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private familyService: FamilyService,
    private teacherService: TeacherService,
    private toastr: ToastrService
  ) {
    this.studentForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.com$/)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^01[012][0-9]{8}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      familyId: [null, [Validators.required]],
      teacherId: [null, [Validators.required]],
      hourlyRate: [0, [Validators.required, Validators.min(0.01)]],
      currency: [0, [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.loadStudents();
    this.loadFamilies();
    this.loadTeachers();
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

  loadStudents(): void {
    this.studentService.getStudents(
      this.pageNumber, 
      this.rowCount, 
      this.selectedFamilyIds.length > 0 ? this.selectedFamilyIds : undefined, 
      this.selectedTeacherIds.length > 0 ? this.selectedTeacherIds : undefined
    ).subscribe({
      next: (res) => {
        this.students = res.data.items;
        this.totalCount = res.data.totalCount;
        this.pagesCount = res.data.pagesCount;
      },
      error: (err) => this.handleError(err)
    });
  }

  onFilterChange(): void {
    this.pageNumber = 1;
    this.loadStudents();
  }

  clearFilters(): void {
    this.selectedFamilyIds = [];
    this.selectedTeacherIds = [];
    this.pageNumber = 1;
    this.loadStudents();
  }

  loadFamilies(): void {
    this.familyService.getFamilies(1, 1000).subscribe({
      next: (res: any) => {
        this.families = res.data.items;
      }
    });
  }

  loadTeachers(): void {
    this.teacherService.getTeachers(1, 1000).subscribe({
      next: (res: any) => {
        this.teachers = res.data.items;
      }
    });
  }

  onPageChange(event: PageChangeEvent): void {
    this.pageNumber = event.pageNumber;
    this.rowCount = event.rowCount;
    this.loadStudents();
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
    this.selectedStudentId = null;
    this.studentForm.reset({
      hourlyRate: 0,
      currency: 0
    });
    this.studentForm.get('email')?.enable();
    this.studentForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.studentForm.get('confirmPassword')?.setValidators([Validators.required]);
    this.studentForm.updateValueAndValidity();
  }

  openEditModal(id: number): void {
    this.isEditMode = true;
    this.selectedStudentId = id;
    this.studentService.getStudentById(id).subscribe({
      next: (res) => {
        const student = res.data;
        this.studentForm.patchValue({
          fullName: student.studentName,
          email: student.email,
          phoneNumber: student.phoneNumber,
          familyId: student.familyId,
          teacherId: student.teacherId,
          hourlyRate: student.hourlyRate,
          currency: student.currency,
          password: '',
          confirmPassword: ''
        });
        this.studentForm.get('password')?.setValidators([]);
        this.studentForm.get('password')?.updateValueAndValidity();
        this.studentForm.get('confirmPassword')?.setValidators([]);
        this.studentForm.get('confirmPassword')?.updateValueAndValidity();
      },
      error: (err) => this.handleError(err)
    });
  }

  submitForm(): void {
    if (this.studentForm.invalid) {
      this.studentForm.markAllAsTouched();
      return;
    }

    const formData = this.studentForm.getRawValue();
    if (this.isEditMode && this.selectedStudentId) {
      const updateData = { ...formData };
      if (!updateData.password) delete updateData.password;
      delete updateData.confirmPassword;
      delete updateData.email;

      this.studentService.updateStudent(this.selectedStudentId, updateData).subscribe({
        next: (res) => {
          this.toastr.success(res.message);
          this.loadStudents();
          this.closeOffcanvas('offcanvas_edit');
        },
        error: (err) => this.handleError(err)
      });
    } else {
      const createData = { ...formData };
      delete createData.confirmPassword;

      this.studentService.createStudent(createData).subscribe({
        next: (res) => {
          this.toastr.success(res.message);
          this.loadStudents();
          this.closeOffcanvas('offcanvas_add');
        },
        error: (err) => this.handleError(err)
      });
    }
  }

  openDeleteModal(id: number): void {
    this.selectedStudentId = id;
  }

  onDeleteStudent(): void {
    if (this.selectedStudentId) {
      this.studentService.deleteStudent(this.selectedStudentId).subscribe({
        next: (res) => {
          this.toastr.success(res.message);
          this.loadStudents();
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

  get fullName() { return this.studentForm.get('fullName')!; }
  get email() { return this.studentForm.get('email')!; }
  get phoneNumber() { return this.studentForm.get('phoneNumber')!; }
  get password() { return this.studentForm.get('password')!; }
  get confirmPassword() { return this.studentForm.get('confirmPassword')!; }
  get familyId() { return this.studentForm.get('familyId')!; }
  get teacherId() { return this.studentForm.get('teacherId')!; }
  get hourlyRate() { return this.studentForm.get('hourlyRate')!; }
  get currency() { return this.studentForm.get('currency')!; }
}
