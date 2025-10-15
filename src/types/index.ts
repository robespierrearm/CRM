export type TenderStatus = 
  | 'Новый'
  | 'Подано'
  | 'Рассмотрение'
  | 'Победа'
  | 'В работе'
  | 'Завершён - Оплачен'
  | 'Проигран';

export interface Tender {
  id: string;
  name: string;
  url: string;
  status: TenderStatus;
  publicationDate: string;
  submissionDeadline?: string; // Дедлайн подачи заявки
  submissionDate?: string; // Фактическая дата подачи
  initialPrice: number; // Начальная цена (блокируется после "Подано")
  mySubmissionPrice?: number; // Моя цена подачи (указывается при смене на "Подано")
  winnerPrice?: number; // Цена победителя (для статуса "Проигран")
  contractSecurityPercent: number;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email: string;
  contactPerson: string;
}

export interface Reminder {
  id: string;
  tenderId: string;
  type: 'Подача заявки' | 'Рассмотрение' | 'Другое';
  dateTime: string;
  description: string;
  completed: boolean;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  comment?: string;
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

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'user';
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
