import { Currency } from "./currency.enum";

// Lesson Evaluation Enum
export enum LessonEvaluation {
    Acceptable = 1,  // مقبول
    Good = 2,        // جيد
    VeryGood = 3,    // جيد جدًا
    Excellent = 4    // ممتاز
}

export const LessonEvaluationLabels: { [key in LessonEvaluation]: string } = {
    [LessonEvaluation.Acceptable]: 'مقبول',
    [LessonEvaluation.Good]: 'جيد',
    [LessonEvaluation.VeryGood]: 'جيد جداً',
    [LessonEvaluation.Excellent]: 'ممتاز'
};

export const LessonEvaluationOptions = [
    { label: 'مقبول', value: LessonEvaluation.Acceptable },
    { label: 'جيد', value: LessonEvaluation.Good },
    { label: 'جيد جداً', value: LessonEvaluation.VeryGood },
    { label: 'ممتاز', value: LessonEvaluation.Excellent }
];

export interface ILessonResponse {
    id: number;
    
    // الطالب
    studentId: number;
    studentName: string;
    
    // المعلم
    teacherId: number;
    teacherName: string;
    
    // المشرف
    supervisorId: number | null;
    supervisorName: string;
    
    // العائلة
    familyId: number;
    familyName: string;
    
    // بيانات الدرس
    lessonDate: string;
    durationMinutes: number;
    notes: string | null;
    
    // تقييم الدرس
    evaluation: LessonEvaluation | null;
    
    // المبالغ
    studentHourlyRate: number;
    teacherHourlyRate: number;
    currency: Currency;
    
    createdAt: string;
}

export interface ICreateLesson {
    studentId: number;
    teacherId?: number;
    lessonDate: string;
    durationMinutes: number;
    notes?: string;
    evaluation?: LessonEvaluation;
}

export interface IUpdateLesson {
    studentId?: number;
    teacherId?: number;
    lessonDate?: string;
    durationMinutes?: number;
    notes?: string;
    evaluation?: LessonEvaluation;
}
