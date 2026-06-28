import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { EmailAlreadyExistsError } from '../../../core/errors/auth.errors';
import { AdminAccountProtectedError, UserNotFoundError } from '../../../core/errors/user.errors';
import type {
  CreateManagedUserInput,
  UpdateManagedUserInput,
  User,
} from '../../../models';
import { UserService } from '../../../services';
import {
  DeleteUserDialogComponent,
  type DeleteUserDialogData,
} from './delete-user-dialog/delete-user-dialog.component';
import {
  UserFormDialogComponent,
  type UserFormDialogData,
  type UserFormDialogResult,
} from './user-form-dialog/user-form-dialog.component';

@Component({
  selector: 'app-admin-users',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatTooltipModule,
  ],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss',
})
export class AdminUsersComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly displayedColumns = ['email', 'role', 'status', 'actions'] as const;
  protected readonly users = signal<User[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly isSaving = signal(false);

  ngOnInit(): void {
    void this.loadUsers();
  }

  protected isProtectedAdmin(user: User): boolean {
    return this.userService.isProtectedAdminAccount(user);
  }

  protected openCreateDialog(): void {
    const dialogRef = this.dialog.open<
      UserFormDialogComponent,
      UserFormDialogData,
      UserFormDialogResult
    >(UserFormDialogComponent, {
      width: '32rem',
      maxWidth: '95vw',
      data: { mode: 'create' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && 'password' in result) {
        void this.createUser(result);
      }
    });
  }

  protected openEditDialog(user: User): void {
    const dialogRef = this.dialog.open<
      UserFormDialogComponent,
      UserFormDialogData,
      UserFormDialogResult
    >(UserFormDialogComponent, {
      width: '32rem',
      maxWidth: '95vw',
      data: { mode: 'edit', user },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && 'id' in result) {
        void this.updateUser(result);
      }
    });
  }

  protected openDeleteDialog(user: User): void {
    if (this.isProtectedAdmin(user)) {
      this.showError('The admin account cannot be deleted.');
      return;
    }

    const dialogRef = this.dialog.open<DeleteUserDialogComponent, DeleteUserDialogData, boolean>(
      DeleteUserDialogComponent,
      {
        width: '28rem',
        maxWidth: '95vw',
        data: { email: user.email },
      },
    );

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed && user.id !== undefined) {
        void this.deleteUser(user.id);
      }
    });
  }

  private async loadUsers(): Promise<void> {
    this.isLoading.set(true);

    try {
      const users = await this.userService.getAllUsers();
      this.users.set(users);
    } catch (error) {
      this.showError(this.resolveErrorMessage(error));
    } finally {
      this.isLoading.set(false);
    }
  }

  private async createUser(input: CreateManagedUserInput): Promise<void> {
    this.isSaving.set(true);

    try {
      await this.userService.createManagedUser(input);
      this.showSuccess('User created successfully.');
      await this.loadUsers();
    } catch (error) {
      this.showError(this.resolveErrorMessage(error));
    } finally {
      this.isSaving.set(false);
    }
  }

  private async updateUser(input: UpdateManagedUserInput): Promise<void> {
    this.isSaving.set(true);

    try {
      await this.userService.updateManagedUser(input);
      this.showSuccess('User updated successfully.');
      await this.loadUsers();
    } catch (error) {
      this.showError(this.resolveErrorMessage(error));
    } finally {
      this.isSaving.set(false);
    }
  }

  private async deleteUser(id: number): Promise<void> {
    this.isSaving.set(true);

    try {
      await this.userService.deleteManagedUser(id);
      this.showSuccess('User deleted successfully.');
      await this.loadUsers();
    } catch (error) {
      this.showError(this.resolveErrorMessage(error));
    } finally {
      this.isSaving.set(false);
    }
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      panelClass: ['snackbar-success'],
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['snackbar-error'],
    });
  }

  private resolveErrorMessage(error: unknown): string {
    if (
      error instanceof EmailAlreadyExistsError ||
      error instanceof AdminAccountProtectedError ||
      error instanceof UserNotFoundError ||
      (error instanceof Error &&
        (error.name === 'EmailAlreadyExistsError' ||
          error.name === 'AdminAccountProtectedError' ||
          error.name === 'UserNotFoundError'))
    ) {
      return error.message;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Something went wrong. Please try again.';
  }
}
