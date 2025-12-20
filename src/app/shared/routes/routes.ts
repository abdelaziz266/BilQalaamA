
export const routes={
  //Authentication
 login: '/login',
 forgotPassword: '/forgot-password',
 register: '/register',
 emailVerification: '/email-verification',
 twoStepVerfication: '/two-step-verification',
 resetPassword: '/reset-password',
 lockScreen: '/lock-screen',

 //Dashboard
 index:'/index',
  //CRM
  companies: '/Companies',
  // Service Category
  serviceCategory:'/ServiceCategory',
  serviceCompanies: '/ServiceCompanies/:serviceId',
  supervisors: '/Supervisors',
  teachers: '/Teachers',
};