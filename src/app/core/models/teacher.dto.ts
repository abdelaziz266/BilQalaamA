import { Currency } from "./currency.enum";

export interface ITeacherResponse {
    id: number;
    teacherName: string;
    phoneNumber: string;
    email: string;
    hourlyRate: number;
    currency: Currency;
    supervisorId?: number;
    supervisorName?: string;
    userId: string;
    createdAt: string;
}

export interface ICreateTeacher {
    fullName: string;
    email: string;
    phoneNumber: string;
    password: string;
    supervisorId?: number;
    hourlyRate: number;
    currency: Currency;
}

export interface IUpdateTeacher {
    id: number;
    fullName: string;
    phoneNumber: string;
    supervisorId?: number;
    hourlyRate: number;
    currency: Currency;
    password?: string;
}
