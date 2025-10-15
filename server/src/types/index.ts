export interface User {
  id: number;
  email: string;
  password_hash: string;
  role: 'admin' | 'user';
  full_name?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Tender {
  id: number;
  name: string;
  url: string;
  status: 'Новый' | 'Подано' | 'Рассмотрение' | 'Победа' | 'В работе' | 'Завершён - Оплачен' | 'Проигран';
  publication_date: string;
  submission_deadline?: string;
  submission_date?: string;
  initial_price: number;
  my_submission_price?: number;
  winner_price?: number;
  contract_security_percent: number;
  created_by?: number;
  created_at: Date;
  updated_at: Date;
}

export interface Supplier {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  contact_person?: string;
  created_by?: number;
  created_at: Date;
  updated_at: Date;
}

export interface Reminder {
  id: number;
  tender_id: number;
  type: 'Подача заявки' | 'Рассмотрение' | 'Другое';
  date_time: string;
  description?: string;
  completed: boolean;
  created_by?: number;
  created_at: Date;
  updated_at: Date;
}

export interface Expense {
  id: number;
  tender_id: number;
  name: string;
  amount: number;
  created_at: Date;
  updated_at: Date;
}

export interface CompanyInfo {
  id: number;
  name: string;
  inn?: string;
  address?: string;
  created_at: Date;
  updated_at: Date;
}

export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
}
