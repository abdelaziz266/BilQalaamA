export interface IGetSupervisor {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  hourlyRate: number;
  currency: number;
}

export interface IAddSupervisor {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  hourlyRate: number;
  currency: number;
}

export interface IUpdateSupervisor extends IAddSupervisor {
  id: number;
}
