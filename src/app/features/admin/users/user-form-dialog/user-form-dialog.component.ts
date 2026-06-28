import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import type { CreateManagedUserInput, UpdateManagedUserInput, User } from '../../../../models';
import { UserRole } from '../../../../models';
import { UserService } from '../../../../services';

export type UserFormDialogData =
  | { mode: 'create' }
  | { mode: 'edit'; user: User };

export type UserFormDialogResult = CreateManagedUserInput | UpdateManagedUserInput;

@Component({
  selector: 'app-user-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './user-form-dialog.component.html',
})
export class UserFormDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<UserFormDialogComponent, UserFormDialogResult>);
  private readonly formBuilder = inject(FormBuilder);
  private readonly userService = inject(UserService);
  protected readonly data = inject<UserFormDialogData>(MAT_DIALOG_DATA);

  protected readonly isSubmitting = signal(false);
  protected hidePassword = true;
  protected readonly roles = [
    { value: UserRole.User, label: 'User' },
    { value: UserRole.Admin, label: 'Admin' },
  ];
  protected readonly statuses = [
    { value: true, label: 'Active' },
    { value: false, label: 'Inactive' },
  ];

  protected readonly isEditMode = this.data.mode === 'edit';
  protected readonly editUser = this.data.mode === 'edit' ? this.data.user : null;
  protected readonly isProtectedAdmin = this.editUser
    ? this.userService.isProtectedAdminAccount(this.editUser)
    : false;

  protected readonly form = this.formBuilder.nonNullable.group({
    email: [
      {
        value: this.editUser?.email ?? '',
        disabled: this.isProtectedAdmin,
      },
      [Validators.required, Validators.email],
    ],
    password: ['', this.isEditMode ? [] : [Validators.required]],
    role: [
      {
        value: this.editUser?.role ?? UserRole.User,
        disabled: this.isProtectedAdmin,
      },
      Validators.required,
    ],
    isActive: [this.editUser?.isActive ?? true, Validators.required],
  });

  protected async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    try {
      const rawValue = this.form.getRawValue();

      if (this.isEditMode && this.editUser) {
        this.dialogRef.close({
          id: this.editUser.id!,
          email: rawValue.email,
          role: rawValue.role,
          isActive: rawValue.isActive,
        } satisfies UpdateManagedUserInput);
        return;
      }

      this.dialogRef.close({
        email: rawValue.email,
        password: rawValue.password,
        role: rawValue.role,
        isActive: rawValue.isActive,
      } satisfies CreateManagedUserInput);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  protected hasError(controlName: 'email' | 'password' | 'role' | 'isActive', errorCode: string): boolean {
    const control = this.form.controls[controlName];
    return control.hasError(errorCode) && (control.dirty || control.touched);
  }

  protected onCancel(): void {
    this.dialogRef.close();
  }
}
