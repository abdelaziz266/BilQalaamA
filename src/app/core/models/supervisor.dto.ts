export interface IGetSupervisor {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  supervisorName: string;
  hourlyRate: number;
  currency: number;
}

export interface IAddSupervisor {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  supervisorName: string;
  hourlyRate: number;
  currency: number;
}

export interface IUpdateSupervisor extends IAddSupervisor {
  id: number;
}
