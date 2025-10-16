// Supabase Database Types
import type { Database } from '../integrations/supabase/types';

// Русские статусы для UI (конвертируются в английские при отправке в БД)
export type TenderStatus = 
  | 'Новый'
  | 'Подано'
  | 'Рассмотрение'
  | 'Победа'
  | 'В работе'
  | 'Завершён - Оплачен'
  | 'Проигран';

// Supabase Tender type
export type DbTender = Database['public']['Tables']['tenders']['Row'];
export type DbTenderInsert = Database['public']['Tables']['tenders']['Insert'];
export type DbTenderUpdate = Database['public']['Tables']['tenders']['Update'];

// Frontend Tender interface (совместимый с UI)
export interface Tender {
  id: string;
  user_id?: string | null;
  title: string | null; // name -> title
  link: string | null; // url -> link
  status: TenderStatus;
  publish_date: string; // publicationDate -> publish_date
  deadline?: string | null; // submissionDeadline -> deadline
  submission_date?: string | null; // submissionDate -> submission_date
  amount: number | null; // initialPrice -> amount
  win_amount?: number | null; // mySubmissionPrice -> win_amount
  contract_guarantee_percent: number | null; // contractSecurityPercent -> contract_guarantee_percent
  contract_guarantee_amount?: number | null;
  review_date?: string | null;
  completion_deadline?: string | null;
  comment?: string | null;
  is_archived: boolean;
  archived_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Supabase Supplier type
export type DbSupplier = Database['public']['Tables']['suppliers']['Row'];
export type DbSupplierInsert = Database['public']['Tables']['suppliers']['Insert'];
export type DbSupplierUpdate = Database['public']['Tables']['suppliers']['Update'];

export interface Supplier {
  id: string;
  user_id?: string | null;
  name: string;
  contact_person: string | null; // contactPerson -> contact_person
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  inn?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Reminder type (TODO: создать таблицу в Supabase)
export interface Reminder {
  id: string;
  tender_id: string; // tenderId -> tender_id
  type: 'submission' | 'review' | 'other'; // тип изменен для БД
  reminder_date: string; // dateTime -> reminder_date
  description: string;
  is_completed: boolean; // completed -> is_completed
  created_at?: string;
  user_id?: string;
}

// Supabase Expense type
export type DbExpense = Database['public']['Tables']['expenses']['Row'];
export type DbExpenseInsert = Database['public']['Tables']['expenses']['Insert'];
export type DbExpenseUpdate = Database['public']['Tables']['expenses']['Update'];

export interface Expense {
  id: string;
  tender_id: string;
  amount: number;
  description?: string | null; // name -> description
  category?: string | null;
  date: string;
  created_at?: string;
}

export interface AccountingEntry {
  tenderId: string;
  expenses: Expense[];
}

export interface CompanyInfo {
  name: string;
  inn: string;
  kpp?: string;
  ogrn?: string;
  bankName?: string;
  bik?: string;
  checkingAccount?: string;
  correspondentAccount?: string;
  directorName?: string;
  phone?: string;
  email?: string;
  address?: string;
}

// Supabase User (используется Supabase Auth)
export interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    role?: 'admin' | 'user';
  };
  created_at?: string;
}

export interface DownloadableFile {
  id: string;
  name: string;
  description: string;
  url: string;
  fileType: string;
  uploadDate: string;
  isDefault?: boolean; // Для файлов, которые были изначально
}
