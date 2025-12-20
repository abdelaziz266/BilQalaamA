import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { SelectModule } from 'primeng/select';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatSortModule, Sort } from '@angular/material/sort';
import { CustomPaginationComponent, PageChangeEvent } from '../../../../shared/components/custom-pagination/custom-pagination.component';
import { IGetSupervisor, IAddSupervisor, IUpdateSupervisor } from '../../../../core/models/supervisor.dto';
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
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      password: ['', this.isEditMode ? [] : [Validators.required]],
      supervisorName: ['', Validators.required],
      hourlyRate: [0, [Validators.required, Validators.min(0)]],
      currency: [1, Validators.required]
    });
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
    this.supervisorService.GetSupervisors(this.pageNumber, this.rowCount).subscribe({
      next: (res) => {
        if (res.status === 200) {
          this.supervisors = res.data.data;
          this.pagesCount = res.data.pagesCount;
          this.totalCount = res.data.total;
        }
      },
      error: (err) => {
        this.toastr.error('Failed to load supervisors');
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
      supervisorName: '',
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
        fullName: supervisor.fullName,
        email: supervisor.email,
        phoneNumber: supervisor.phoneNumber,
        supervisorName: supervisor.supervisorName,
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
    if (this.supervisorForm.invalid) {
      this.supervisorForm.markAllAsTouched();
      return;
    }

    const data = this.supervisorForm.value;

    if (this.isEditMode && this.selectedSupervisorId) {
      this.supervisorService.updateSupervisor(this.selectedSupervisorId, { ...data, id: this.selectedSupervisorId }).subscribe({
        next: (res) => {
          this.toastr.success('Supervisor updated successfully');
          this.getSupervisors();
          // Close offcanvas using data-bs-dismiss or similar if needed, 
          // but usually handled by the button in HTML
        },
        error: (err) => {
          this.toastr.error('Update failed');
        }
      });
    } else {
      this.supervisorService.createSupervisor(data).subscribe({
        next: (res) => {
          this.toastr.success('Supervisor created successfully');
          this.getSupervisors();
        },
        error: (err) => {
          this.toastr.error('Creation failed');
        }
      });
    }
  }

  onDeleteSupervisor(): void {
    if (this.selectedSupervisorId) {
      this.supervisorService.deleteSupervisor(this.selectedSupervisorId).subscribe({
        next: (res) => {
          this.toastr.success('Supervisor deleted successfully');
          this.getSupervisors();
        },
        error: (err) => {
          this.toastr.error('Delete failed');
        }
      });
    }
  }

  sortData(sort: Sort): void {
    // Implement sorting if needed
  }
}
