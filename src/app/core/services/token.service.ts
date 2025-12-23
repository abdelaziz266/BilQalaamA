import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import * as CryptoJS from 'crypto-js';
import { CookieService } from 'ngx-cookie-service'; // ✅ لازم يكون موجود

export enum UserRole {
  SuperAdmin = 0, // مشرف عام
  Admin = 1,      // مشرف
  Teacher = 2,    // معلم
  Student = 3,    // طالب
  Family = 4      // عائلة
}

export const UserRoleLabels: { [key in UserRole]: string } = {
  [UserRole.SuperAdmin]: 'مشرف عام',
  [UserRole.Admin]: 'مشرف',
  [UserRole.Teacher]: 'معلم',
  [UserRole.Student]: 'طالب',
  [UserRole.Family]: 'عائلة'
};

export interface DecodedToken {
  sub?: string;
  name?: string;
  email?: string;
  role?: string | number;
  exp?: number;
  iat?: number;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly TOKEN_KEY = 'z7x9v2m5p8q1r4t3';
  private readonly SECRET_KEY = environment.secretKey;

  constructor(private cookieService: CookieService) {}

  /**
   * ✅ حفظ التوكين بعد تشفيره في الـ cookies
   */
  saveToken(token: string): void {
    const encrypted = CryptoJS.AES.encrypt(token, this.SECRET_KEY).toString();

    // حفظ في الكوكيز مع إعدادات الأمان
    this.cookieService.set(this.TOKEN_KEY, encrypted, {
      expires: 1,          // صلاحية يوم واحد
      sameSite: 'Strict',  // يمنع التسريب عبر مواقع أخرى
      secure: true,        // فقط عبر HTTPS
      path: '/'            // متاح على مستوى التطبيق كله
    });
  }

  /**
   * 🔓 فك تشفير التوكين عند قراءته
   */
  getToken(): string | null {
    const encrypted = this.cookieService.get(this.TOKEN_KEY);
    if (!encrypted) return null;

    try {
      const bytes = CryptoJS.AES.decrypt(encrypted, this.SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return decrypted || null;
    } catch (err) {
      return null;
    }
  }

  /**
   * ❌ حذف التوكين (عند تسجيل الخروج)
   */
  clearToken(): void {
    this.cookieService.delete(this.TOKEN_KEY, '/');
  }

  /**
   * 🧠 التحقق من وجود توكين صالح
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token; // موجود = true
  }

  /**
   * 🔍 فك تشفير JWT واستخراج البيانات
   */
  decodeToken(): DecodedToken | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = parts[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch (err) {
      console.error('Error decoding token:', err);
      return null;
    }
  }

  /**
   * 👤 الحصول على اسم المستخدم من التوكين
   */
  getUserName(): string {
    const decoded = this.decodeToken();
    debugger;
    return decoded?.name || decoded?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 'مستخدم';
  }

  /**
   * 📧 الحصول على البريد الإلكتروني من التوكين
   */
  getUserEmail(): string {
    const decoded = this.decodeToken();
    return decoded?.email || decoded?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || '';
  }

  /**
   * 🎭 الحصول على دور المستخدم من التوكين
   */
  getUserRole(): UserRole | null {
    const decoded = this.decodeToken();
    if (!decoded) return null;

    const role = decoded?.role || decoded?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    
    if (typeof role === 'number') {
      return role as UserRole;
    }
    
    if (typeof role === 'string') {
      // Try to parse as number first
      const roleNum = parseInt(role, 10);
      if (!isNaN(roleNum)) {
        return roleNum as UserRole;
      }
      
      // Try to match role name
      const roleNames: { [key: string]: UserRole } = {
        'SuperAdmin': UserRole.SuperAdmin,
        'Admin': UserRole.Admin,
        'Teacher': UserRole.Teacher,
        'Student': UserRole.Student,
        'Family': UserRole.Family
      };
      return roleNames[role] ?? null;
    }
    
    return null;
  }

  /**
   * 🏷️ الحصول على اسم الدور بالعربي
   */
  getUserRoleLabel(): string {
    const role = this.getUserRole();
    if (role === null) return 'مستخدم';
    return UserRoleLabels[role] || 'مستخدم';
  }

  /**
   * ⏰ التحقق من صلاحية التوكين
   */
  isTokenExpired(): boolean {
    const decoded = this.decodeToken();
    if (!decoded?.exp) return true;
    
    const expirationDate = new Date(decoded.exp * 1000);
    return expirationDate <= new Date();
  }
}
