import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatSortModule, Sort } from '@angular/material/sort';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { CustomPaginationComponent, PageChangeEvent } from '../../../../shared/components/custom-pagination/custom-pagination.component';
import { ILessonResponse, LessonEvaluation, LessonEvaluationLabels, LessonEvaluationOptions } from '../../../../core/models/lesson.dto';
import { IFamilyResponse } from '../../../../core/models/family.dto';
import { ITeacherResponse } from '../../../../core/models/teacher.dto';
import { IStudentResponse } from '../../../../core/models/student.dto';
import { IGetSupervisor } from '../../../../core/models/supervisor.dto';
import { LessonService } from '../../../../core/services/lesson.service';
import { FamilyService } from '../../../../core/services/family.service';
import { TeacherService } from '../../../../core/services/teacher.service';
import { StudentService } from '../../../../core/services/student.service';
import { SupervisorService } from '../../../../core/services/supervisor.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-lessons-home',
  standalone: true,
  imports: [ReactiveFormsModule, SelectModule, MultiSelectModule, FormsModule, CommonModule, RouterLink, CustomPaginationComponent, MatSortModule, BsDatepickerModule],
  templateUrl: './lessons-home.component.html',
  styleUrls: ['./lessons-home.component.scss']
})
export class LessonsHomeComponent implements OnInit, AfterViewInit {
  @ViewChild('offcanvasAdd', { static: false }) offcanvasAdd!: ElementRef;
  @ViewChild('offcanvasEdit', { static: false }) offcanvasEdit!: ElementRef;

  lessons: ILessonResponse[] = [];
  families: IFamilyResponse[] = [];
  teachers: ITeacherResponse[] = [];
  students: IStudentResponse[] = [];
  supervisors: IGetSupervisor[] = [];

  totalCount = 0;
  rowCount = 10;
  pageNumber = 1;
  pagesCount = 0;

  lessonForm: FormGroup;
  isEditMode = false;
  selectedLessonId: number | null = null;

  evaluationOptions = LessonEvaluationOptions;

  durationOptions = [
    { label: '20 دقيقة', value: 20 },
    { label: '30 دقيقة', value: 30 },
    { label: '40 دقيقة', value: 40 },
    { label: '45 دقيقة', value: 45 },
    { label: '60 دقيقة', value: 60 },
    { label: '90 دقيقة', value: 90 }
  ];

  // Filters
  selectedFamilyIds: number[] = [];
  selectedTeacherIds: number[] = [];
  selectedStudentIds: number[] = [];
  selectedSupervisorIds: number[] = [];
  fromDate: Date | undefined;
  toDate: Date | undefined;

  // Track previous date values to avoid unnecessary API calls
  private prevFromDate: Date | undefined;
  private prevToDate: Date | undefined;

  constructor(
    private fb: FormBuilder,
    private lessonService: LessonService,
    private familyService: FamilyService,
    private teacherService: TeacherService,
    private studentService: StudentService,
    private supervisorService: SupervisorService,
    private toastr: ToastrService
  ) {
    this.lessonForm = this.fb.group({
      studentId: [null, [Validators.required]],
      teacherId: [null, [Validators.required]],
      lessonDate: [new Date(), [Validators.required]],
      durationMinutes: [60, [Validators.required, Validators.min(1)]],
      evaluation: [null],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadLessons();
    this.loadFamilies();

    this.loadTeachers();
    this.loadStudents();
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

  loadLessons(): void {
    this.lessonService.getLessons(
      this.pageNumber,
      this.rowCount,
      this.selectedSupervisorIds.length > 0 ? this.selectedSupervisorIds : undefined,
      this.selectedTeacherIds.length > 0 ? this.selectedTeacherIds : undefined,
      this.selectedStudentIds.length > 0 ? this.selectedStudentIds : undefined,
      this.selectedFamilyIds.length > 0 ? this.selectedFamilyIds : undefined,
      this.fromDate ? this.formatDate(this.fromDate) : undefined,
      this.toDate ? this.formatDate(this.toDate) : undefined
    ).subscribe({
      next: (res) => {
        this.lessons = res.data.items;
        this.totalCount = res.data.totalCount;
        this.pagesCount = res.data.pagesCount;
      },
      error: (err) => this.handleError(err)
    });
  }

  loadFamilies(): void {
    this.familyService.getFamilies(1, 1000).subscribe({
      next: (res: any) => {
        this.families = res.data.items;
      }
    });
  }

  onSupervisorChange(): void {
    debugger;
    if (this.selectedSupervisorIds.length > 0) {
      // Load families based on selected supervisors
      this.familyService.getFamiliesBySupervisor(this.selectedSupervisorIds).subscribe({
        next: (res: any) => {
          this.families = res.data.items;
          // Reset family filter when supervisor changes
          this.selectedFamilyIds = [];
        },
        error: (err) => this.handleError(err)
      });
      this.teacherService.getTeavhersBySupervisors(this.selectedSupervisorIds).subscribe({
        next: (res: any) => {
          this.teachers = res.data.items;
          // Reset family filter when supervisor changes
          this.selectedTeacherIds = [];
        },
        error: (err) => this.handleError(err)
      });
    }
    else {
      this.loadFamilies();
      this.loadTeachers();
    }
  }
    onFamilyChange(): void {
      debugger;
      if(this.selectedFamilyIds.length > 0) {
      // Load families based on selected supervisors
      this.studentService.getStudentsByFamilies(this.selectedFamilyIds).subscribe({
        next: (res: any) => {
          this.students = res.data.items;
          // Reset family filter when supervisor changes
          this.selectedStudentIds = [];
        },
        error: (err) => this.handleError(err)
      });
    }
    else {
      this.loadStudents();
    }

    // Reset page and reload lessons
    this.pageNumber = 1;
    this.loadLessons();
  }

  onSupervisorClear(): void {

    this.selectedSupervisorIds = [];
    this.loadFamilies();
    this.selectedFamilyIds = [];
    this.pageNumber = 1;
    this.loadLessons();
  }
  onFamilyClear(): void {
    this.selectedFamilyIds = [];
    this.selectedTeacherIds = [];
    this.selectedStudentIds = [];
    this.pageNumber = 1;
    this.loadLessons();
  }

  loadTeachers(): void {
    this.teacherService.getTeachers(1, 1000).subscribe({
      next: (res: any) => {
        this.teachers = res.data.items;
      }
    });
  }

  loadStudents(): void {
    this.studentService.getStudents(1, 1000).subscribe({
      next: (res: any) => {
        this.students = res.data.items;
      }
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
    this.loadLessons();
  }

  sortData(sort: Sort): void {
    // Implementation for sorting if needed
  }

  onFilterChange(): void {
    this.pageNumber = 1;
    this.loadLessons();
  }

  onFromDateChange(): void {
    // Skip if date hasn't actually changed
    if (this.fromDate === this.prevFromDate) return;
    this.prevFromDate = this.fromDate;

    if (!this.fromDate) {
      this.toDate = undefined;
      this.prevToDate = undefined;
    }
    this.pageNumber = 1;
    this.loadLessons();
  }

  onToDateChange(): void {
    // Skip if date hasn't actually changed
    if (this.toDate === this.prevToDate) return;
    this.prevToDate = this.toDate;

    if (this.fromDate && this.toDate && this.toDate < this.fromDate) {
      this.toDate = undefined;
      this.prevToDate = undefined;
    }
    this.pageNumber = 1;
    this.loadLessons();
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  hasActiveFilters(): boolean {
    return (this.selectedFamilyIds && this.selectedFamilyIds.length > 0) ||
      (this.selectedTeacherIds && this.selectedTeacherIds.length > 0) ||
      (this.selectedStudentIds && this.selectedStudentIds.length > 0) ||
      (this.selectedSupervisorIds && this.selectedSupervisorIds.length > 0) ||
      !!this.fromDate ||
      !!this.toDate;
  }

  clearFilters(): void {
    this.selectedFamilyIds = [];
    this.selectedTeacherIds = [];
    this.selectedStudentIds = [];
    this.selectedSupervisorIds = [];
    this.fromDate = undefined;
    this.toDate = undefined;
    this.prevFromDate = undefined;
    this.prevToDate = undefined;
    this.pageNumber = 1;
    this.loadLessons();
  }

  resetForm(): void {
    this.isEditMode = false;
    this.selectedLessonId = null;
    this.lessonForm.reset({
      lessonDate: new Date(),
      durationMinutes: 60
    });
  }

  openEditModal(id: number): void {
    this.isEditMode = true;
    this.selectedLessonId = id;
    this.lessonService.getLessonById(id).subscribe({
      next: (res) => {
        const lesson = res.data;
        // Convert date string to Date object for bsDatepicker
        const lessonDate = new Date(lesson.lessonDate);

        this.lessonForm.patchValue({
          studentId: lesson.studentId,
          teacherId: lesson.teacherId,
          lessonDate: lessonDate,
          durationMinutes: lesson.durationMinutes,
          evaluation: lesson.evaluation,
          notes: lesson.notes || ''
        });
      },
      error: (err) => this.handleError(err)
    });
  }

  submitForm(): void {
    if (this.lessonForm.invalid) {
      this.lessonForm.markAllAsTouched();
      return;
    }

    const formData = this.lessonForm.getRawValue();

    if (this.isEditMode && this.selectedLessonId) {
      const updateData = {
        studentId: formData.studentId,
        teacherId: formData.teacherId,
        lessonDate: formData.lessonDate,
        durationMinutes: formData.durationMinutes,
        evaluation: formData.evaluation,
        notes: formData.notes
      };

      this.lessonService.updateLesson(this.selectedLessonId, updateData).subscribe({
        next: (res) => {
          this.toastr.success(res.message);
          this.loadLessons();
          this.closeOffcanvas('offcanvas_edit');
        },
        error: (err) => this.handleError(err)
      });
    } else {
      const createData = {
        studentId: formData.studentId,
        teacherId: formData.teacherId,
        lessonDate: formData.lessonDate,
        durationMinutes: formData.durationMinutes,
        evaluation: formData.evaluation,
        notes: formData.notes
      };

      this.lessonService.createLesson(createData).subscribe({
        next: (res) => {
          this.toastr.success(res.message);
          this.loadLessons();
          this.closeOffcanvas('offcanvas_add');
        },
        error: (err) => this.handleError(err)
      });
    }
  }

  openDeleteModal(id: number): void {
    this.selectedLessonId = id;
  }

  onDeleteLesson(): void {
    if (this.selectedLessonId) {
      this.lessonService.deleteLesson(this.selectedLessonId).subscribe({
        next: (res) => {
          this.toastr.success(res.message);
          this.loadLessons();
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

  getEvaluationLabel(value: LessonEvaluation | null): string {
    if (value === null || value === undefined) return '---';
    return LessonEvaluationLabels[value as keyof typeof LessonEvaluationLabels] || '---';
  }

  getEvaluationBadgeClass(value: LessonEvaluation | null): string {
    if (value === null || value === undefined) return 'badge-soft-secondary';
    switch (value) {
      case LessonEvaluation.Excellent:
        return 'badge-soft-success';
      case LessonEvaluation.VeryGood:
        return 'badge-soft-info';
      case LessonEvaluation.Good:
        return 'badge-soft-primary';
      case LessonEvaluation.Acceptable:
        return 'badge-soft-warning';
      default:
        return 'badge-soft-secondary';
    }
  }

  get studentId() { return this.lessonForm.get('studentId')!; }
  get teacherId() { return this.lessonForm.get('teacherId')!; }
  get lessonDate() { return this.lessonForm.get('lessonDate')!; }
  get durationMinutes() { return this.lessonForm.get('durationMinutes')!; }
  get evaluation() { return this.lessonForm.get('evaluation')!; }
  get notes() { return this.lessonForm.get('notes')!; }
}
