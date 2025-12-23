import { Currency } from "./currency.enum";

export interface IStudentResponse {
    id: number;
    studentName: string;
    phoneNumber: string;
    email: string;
    hourlyRate: number;
    currency: Currency;
    familyId: number;
    familyName: string;
    teacherId: number;
    teacherName: string;
    userId: string;
    createdAt: string;
}

export interface ICreateStudent {
    fullName: string;
    email: string;
    phoneNumber: string;
    password: string;
    hourlyRate: number;
    currency: Currency;
    familyId: number;
    teacherId: number;
}

export interface IUpdateStudent {
    fullName: string;
    phoneNumber: string;
    hourlyRate: number;
    currency: Currency;
    familyId: number;
    teacherId: number;
    password?: string;
}
