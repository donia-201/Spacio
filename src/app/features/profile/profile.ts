import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../core/Services/auth.service';
import { LocationService } from '../../core/Services/location.service';
import { AdminUserService } from '../../core/Services/admin-user.service';
import { UserRole } from '../../core/models/models';
import { StatusPipe } from '../../shared/pipes/status-pipe';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusPipe],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private auth = inject(AuthService);
  private location = inject(LocationService);
  private adminUserService = inject(AdminUserService);
  private router = inject(Router);

  // Editable fields, seeded from the profile.
  firstName = '';
  lastName = '';
  phone = '';

  // Password change
  oldPassword = '';
  newPassword = '';
  confirmPassword = '';

  // Admin: role editing for other people
  readonly allUsers = signal<
    Array<{ _id: string; firstName: string; lastName: string; email: string; role: UserRole }>
  >([]);
  readonly savingRoleFor = signal<string | null>(null);

  readonly savingProfile = signal(false);
  readonly savingPassword = signal(false);
  readonly locating = signal(false);
  readonly profileDone = signal('');
  readonly passwordDone = signal('');
  readonly error = signal('');
  readonly passwordError = signal('');

  readonly roles: UserRole[] = ['user', 'technician', 'admin'];

  readonly roleLabels: Record<UserRole, string> = {
    user: 'مستخدم',
    technician: 'فني',
    admin: 'مدير',
  };

  get user() {
    return this.auth.currentUser();
  }

  get isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  ngOnInit(): void {
    const user = this.user;
    this.firstName = user?.firstName ?? '';
    this.lastName = user?.lastName ?? '';
    this.phone = user?.phone ?? '';

    if (this.isAdmin) this.loadUsers();
  }

  private loadUsers(): void {
    this.adminUserService.list({ limit: 100 }).subscribe({
      next: (res) => this.allUsers.set(res.data ?? []),
      error: () => this.allUsers.set([]),
    });
  }

  // ---------------- Profile ----------------

  saveProfile(): void {
    this.error.set('');
    this.profileDone.set('');
    this.savingProfile.set(true);

    this.auth
      .updateProfile({
        firstName: this.firstName.trim(),
        lastName: this.lastName.trim(),
        phone: this.phone.trim(),
      })
      .pipe(finalize(() => this.savingProfile.set(false)))
      .subscribe({
        next: () => this.profileDone.set('تم حفظ البيانات ✅'),
        error: (err) => this.error.set(err?.error?.message ?? 'مقدرناش نحفظ البيانات.'),
      });
  }

  // ---------------- Location ----------------

  refreshLocation(): void {
    this.locating.set(true);
    this.profileDone.set('');

    this.location.request().subscribe((coords) => {
      this.locating.set(false);
      this.profileDone.set(
        coords ? 'تم تحديث موقعك ✅' : 'مقدرناش نحدد موقعك. اتأكد من إعدادات المتصفح.',
      );
    });
  }

  // ---------------- Password ----------------

  changePassword(): void {
    this.passwordError.set('');
    this.passwordDone.set('');

    if (this.newPassword.length < 8) {
      this.passwordError.set('كلمة المرور الجديدة لازم تكون 8 أحرف على الأقل.');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.passwordError.set('كلمتا المرور مش متطابقتين.');
      return;
    }

    this.savingPassword.set(true);
    this.auth
      .changePassword(this.oldPassword, this.newPassword)
      .pipe(finalize(() => this.savingPassword.set(false)))
      .subscribe({
        next: () => {
          this.passwordDone.set('تم تغيير كلمة المرور ✅');
          this.oldPassword = '';
          this.newPassword = '';
          this.confirmPassword = '';
        },
        error: (err) => this.passwordError.set(err?.error?.message ?? 'مقدرناش نغير كلمة المرور.'),
      });
  }

  // ---------------- Admin ----------------

  changeRole(userId: string, role: UserRole): void {
    this.savingRoleFor.set(userId);

    this.adminUserService
      .setRole(userId, role)
      .pipe(finalize(() => this.savingRoleFor.set(null)))
      .subscribe({
        next: () =>
          this.allUsers.update((list) =>
            list.map((u) => (u._id === userId ? { ...u, role } : u)),
          ),
        error: () => this.loadUsers(),
      });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/');
  }
}
