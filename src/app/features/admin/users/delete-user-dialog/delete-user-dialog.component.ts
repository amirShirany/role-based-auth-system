import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface DeleteUserDialogData {
  email: string;
}

@Component({
  selector: 'app-delete-user-dialog',
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './delete-user-dialog.component.html',
  styleUrl: './delete-user-dialog.component.scss',
})
export class DeleteUserDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<DeleteUserDialogComponent, boolean>);
  protected readonly data = inject<DeleteUserDialogData>(MAT_DIALOG_DATA);

  protected onCancel(): void {
    this.dialogRef.close(false);
  }

  protected onConfirm(): void {
    this.dialogRef.close(true);
  }
}
