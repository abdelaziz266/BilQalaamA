import { Currency } from './currency.enum';

export interface IFamilyResponse {
    id: number;
    userId: string;
    familyName: string;
    email: string;
    phoneNumber: string;
    country: string;
    supervisorId: number | null;
    supervisorName: string | null;
    hourlyRate: number;
    currency: Currency;
    createdAt: string;
}

export interface ICreateFamily {
    fullName: string;
    email: string;
    phoneNumber: string;
    password: string;
    country: string;
    supervisorId: number | null;
    hourlyRate: number;
    currency: Currency;
}

export interface IUpdateFamily {
    fullName: string;
    phoneNumber: string;
    country: string;
    supervisorId: number | null;
    hourlyRate: number;
    currency: Currency;
    password?: string;
}
