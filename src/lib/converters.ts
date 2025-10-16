// Утилиты для конвертации данных между форматом БД (Supabase) и UI (русский интерфейс)

import type { Tender, Supplier, Expense, TenderStatus } from '../types';
import type { Database } from '../integrations/supabase/types';

type DbTender = Database['public']['Tables']['tenders']['Row'];
type DbSupplier = Database['public']['Tables']['suppliers']['Row'];
type DbExpense = Database['public']['Tables']['expenses']['Row'];

// ========== МАППИНГ СТАТУСОВ ==========

// Русский → Английский (для отправки в БД)
export const statusToDb: Record<string, Database['public']['Enums']['tender_status']> = {
  'Новый': 'accepting',
  'Подано': 'submitted',
  'Рассмотрение': 'review',
  'Победа': 'won',
  'В работе': 'in_progress',
  'Завершён - Оплачен': 'completed',
  'Проигран': 'lost',
};

// Английский → Русский (для отображения в UI)
export const statusFromDb: Record<Database['public']['Enums']['tender_status'], string> = {
  'accepting': 'Новый',
  'submitted': 'Подано',
  'review': 'Рассмотрение',
  'won': 'Победа',
  'in_progress': 'В работе',
  'completed': 'Завершён - Оплачен',
  'lost': 'Проигран',
};

// ========== КОНВЕРТЕРЫ TENDER ==========

// Конвертация из БД в UI формат
export const tenderFromDb = (dbTender: DbTender): Tender => {
  return {
    id: dbTender.id,
    user_id: dbTender.user_id,
    
    // Маппинг полей
    title: dbTender.title,
    link: dbTender.link,
    
    // Конвертация статуса в русский
    status: statusFromDb[dbTender.status] as TenderStatus,
    
    // Даты
    publish_date: dbTender.publish_date || new Date().toISOString(),
    deadline: dbTender.deadline,
    submission_date: dbTender.submission_date,
    review_date: dbTender.review_date,
    completion_deadline: dbTender.completion_deadline,
    
    // Числа
    amount: dbTender.amount,
    win_amount: dbTender.win_amount,
    contract_guarantee_percent: dbTender.contract_guarantee_percent,
    contract_guarantee_amount: dbTender.contract_guarantee_amount,
    
    // Другое
    comment: dbTender.comment,
    is_archived: dbTender.is_archived || false,
    archived_at: dbTender.archived_at,
    created_at: dbTender.created_at,
    updated_at: dbTender.updated_at,
  };
};

// Конвертация из UI формата в БД
export const tenderToDb = (tender: Partial<Tender>): Partial<Database['public']['Tables']['tenders']['Insert']> => {
  const dbTender: any = {};
  
  if (tender.title !== undefined) dbTender.title = tender.title;
  if (tender.link !== undefined) dbTender.link = tender.link;
  
  // Конвертация статуса в английский
  if (tender.status) {
    dbTender.status = statusToDb[tender.status] || 'accepting';
  }
  
  if (tender.publish_date !== undefined) dbTender.publish_date = tender.publish_date;
  if (tender.deadline !== undefined) dbTender.deadline = tender.deadline;
  if (tender.submission_date !== undefined) dbTender.submission_date = tender.submission_date;
  if (tender.review_date !== undefined) dbTender.review_date = tender.review_date;
  if (tender.completion_deadline !== undefined) dbTender.completion_deadline = tender.completion_deadline;
  
  if (tender.amount !== undefined) dbTender.amount = tender.amount;
  if (tender.win_amount !== undefined) dbTender.win_amount = tender.win_amount;
  if (tender.contract_guarantee_percent !== undefined) dbTender.contract_guarantee_percent = tender.contract_guarantee_percent;
  if (tender.contract_guarantee_amount !== undefined) dbTender.contract_guarantee_amount = tender.contract_guarantee_amount;
  
  if (tender.comment !== undefined) dbTender.comment = tender.comment;
  if (tender.is_archived !== undefined) dbTender.is_archived = tender.is_archived;
  if (tender.archived_at !== undefined) dbTender.archived_at = tender.archived_at;
  
  return dbTender;
};

// ========== КОНВЕРТЕРЫ SUPPLIER ==========

export const supplierFromDb = (dbSupplier: DbSupplier): Supplier => {
  return {
    id: dbSupplier.id,
    user_id: dbSupplier.user_id,
    name: dbSupplier.name,
    contact_person: dbSupplier.contact_person,
    phone: dbSupplier.phone,
    email: dbSupplier.email,
    address: dbSupplier.address || undefined,
    inn: dbSupplier.inn || undefined,
    notes: dbSupplier.notes || undefined,
    created_at: dbSupplier.created_at,
    updated_at: dbSupplier.updated_at,
  };
};

export const supplierToDb = (supplier: Partial<Supplier>): Partial<Database['public']['Tables']['suppliers']['Insert']> => {
  const dbSupplier: any = {};
  
  if (supplier.name !== undefined) dbSupplier.name = supplier.name;
  if (supplier.contact_person !== undefined) dbSupplier.contact_person = supplier.contact_person;
  if (supplier.phone !== undefined) dbSupplier.phone = supplier.phone;
  if (supplier.email !== undefined) dbSupplier.email = supplier.email;
  if (supplier.address !== undefined) dbSupplier.address = supplier.address;
  if (supplier.inn !== undefined) dbSupplier.inn = supplier.inn;
  if (supplier.notes !== undefined) dbSupplier.notes = supplier.notes;
  
  return dbSupplier;
};

// ========== КОНВЕРТЕРЫ EXPENSE ==========

export const expenseFromDb = (dbExpense: DbExpense): Expense => {
  return {
    id: dbExpense.id,
    tender_id: dbExpense.tender_id,
    amount: dbExpense.amount,
    description: dbExpense.description,
    category: dbExpense.category,
    date: dbExpense.date,
    created_at: dbExpense.created_at,
  };
};

export const expenseToDb = (expense: Partial<Expense>): Partial<Database['public']['Tables']['expenses']['Insert']> => {
  const dbExpense: any = {};
  
  if (expense.tender_id !== undefined) dbExpense.tender_id = expense.tender_id;
  if (expense.amount !== undefined) dbExpense.amount = expense.amount;
  if (expense.description !== undefined) dbExpense.description = expense.description;
  if (expense.category !== undefined) dbExpense.category = expense.category;
  if (expense.date !== undefined) dbExpense.date = expense.date;
  
  return dbExpense;
};
