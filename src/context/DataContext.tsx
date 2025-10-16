import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from './AuthContext';
import { tenderFromDb, tenderToDb, supplierFromDb, supplierToDb, expenseFromDb, expenseToDb } from '../lib/converters';
import type {
  Tender,
  Supplier,
  Reminder,
  Expense,
  CompanyInfo,
  DownloadableFile,
} from '../types';

interface DataContextType {
  // Tenders
  tenders: Tender[];
  addTender: (tender: Omit<Tender, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTender: (id: string, tender: Partial<Tender>) => Promise<void>;
  deleteTender: (id: string) => Promise<void>;
  
  // Suppliers
  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  
  // Reminders
  reminders: Reminder[];
  addReminder: (reminder: Omit<Reminder, 'id' | 'created_at'>) => Promise<void>;
  updateReminder: (id: string, reminder: Partial<Reminder>) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  
  // Expenses
  expenses: Expense[];
  getExpensesByTenderId: (tenderId: string) => Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'created_at'>) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  
  // Company Info
  companyInfo: CompanyInfo | null;
  updateCompanyInfo: (info: CompanyInfo) => Promise<void>;
  
  // Downloadable Files
  downloadableFiles: DownloadableFile[];
  addDownloadableFile: (file: Omit<DownloadableFile, 'id'>) => Promise<void>;
  updateDownloadableFile: (id: string, file: Partial<DownloadableFile>) => Promise<void>;
  deleteDownloadableFile: (id: string) => Promise<void>;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [downloadableFiles, setDownloadableFiles] = useState<DownloadableFile[]>([]);

  // Load all data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadAllData();
    } else {
      // Clear data when user logs out
      setTenders([]);
      setSuppliers([]);
      setReminders([]);
      setExpenses([]);
      setCompanyInfo(null);
      setDownloadableFiles([]);
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  const loadAllData = async () => {
    console.log('DataContext: Loading all data from Supabase...');
    setIsLoading(true);
    setError(null);

    try {
      await Promise.all([
        loadTenders(),
        loadSuppliers(),
        loadExpenses(),
        loadCompanyInfo(),
        loadDownloadableFiles(),
      ]);
      console.log('DataContext: All data loaded successfully');
    } catch (err) {
      console.error('DataContext: Error loading data:', err);
      setError('Ошибка загрузки данных');
    } finally {
      setIsLoading(false);
    }
  };

  // ========== TENDERS ==========
  const loadTenders = async () => {
    const { data, error } = await supabase
      .from('tenders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading tenders:', error);
      throw error;
    }

    // Конвертируем данные из БД в UI формат
    const convertedTenders = (data || []).map(tenderFromDb);
    setTenders(convertedTenders);
  };

  const addTender = async (tender: Omit<Tender, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    // Конвертируем UI формат в БД формат
    const dbTender = tenderToDb(tender);
    
    const { data, error } = await supabase
      .from('tenders')
      .insert([{
        ...dbTender,
        user_id: user?.id,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding tender:', error);
      throw error;
    }

    if (data) {
      // Конвертируем обратно в UI формат
      const convertedTender = tenderFromDb(data);
      setTenders(prev => [convertedTender, ...prev]);
    }
  };

  const updateTender = async (id: string, tender: Partial<Tender>) => {
    // Конвертируем UI формат в БД формат
    const dbTender = tenderToDb(tender);
    
    const { data, error } = await supabase
      .from('tenders')
      .update(dbTender)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating tender:', error);
      throw error;
    }

    if (data) {
      // Конвертируем обратно в UI формат
      const convertedTender = tenderFromDb(data);
      setTenders(prev => prev.map(t => t.id === id ? convertedTender : t));
    }
  };

  const deleteTender = async (id: string) => {
    const { error } = await supabase
      .from('tenders')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting tender:', error);
      throw error;
    }

    setTenders(prev => prev.filter(t => t.id !== id));
  };

  // ========== SUPPLIERS ==========
  const loadSuppliers = async () => {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading suppliers:', error);
      throw error;
    }

    setSuppliers(data || []);
  };

  const addSupplier = async (supplier: Omit<Supplier, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('suppliers')
      .insert([{
        ...supplier,
        user_id: user?.id,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding supplier:', error);
      throw error;
    }

    if (data) {
      setSuppliers(prev => [data, ...prev]);
    }
  };

  const updateSupplier = async (id: string, supplier: Partial<Supplier>) => {
    const { data, error } = await supabase
      .from('suppliers')
      .update(supplier)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating supplier:', error);
      throw error;
    }

    if (data) {
      setSuppliers(prev => prev.map(s => s.id === id ? data : s));
    }
  };

  const deleteSupplier = async (id: string) => {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting supplier:', error);
      throw error;
    }

    setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  // ========== EXPENSES ==========
  const loadExpenses = async () => {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading expenses:', error);
      throw error;
    }

    setExpenses(data || []);
  };

  const getExpensesByTenderId = (tenderId: string): Expense[] => {
    return expenses.filter(e => e.tender_id === tenderId);
  };

  const addExpense = async (expense: Omit<Expense, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('expenses')
      .insert([expense])
      .select()
      .single();

    if (error) {
      console.error('Error adding expense:', error);
      throw error;
    }

    if (data) {
      setExpenses(prev => [data, ...prev]);
    }
  };

  const updateExpense = async (id: string, expense: Partial<Expense>) => {
    const { data, error } = await supabase
      .from('expenses')
      .update(expense)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating expense:', error);
      throw error;
    }

    if (data) {
      setExpenses(prev => prev.map(e => e.id === id ? data : e));
    }
  };

  const deleteExpense = async (id: string) => {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }

    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  // ========== REMINDERS (LocalStorage for now, TODO: add to Supabase) ==========
  const addReminder = async (reminder: Omit<Reminder, 'id' | 'created_at'>) => {
    const newReminder: Reminder = {
      ...reminder,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    };
    setReminders(prev => [...prev, newReminder]);
    // TODO: Сохранить в Supabase когда будет создана таблица
    localStorage.setItem('reminders', JSON.stringify([...reminders, newReminder]));
  };

  const updateReminder = async (id: string, reminder: Partial<Reminder>) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, ...reminder } : r));
    // TODO: Обновить в Supabase
    const updated = reminders.map(r => r.id === id ? { ...r, ...reminder } : r);
    localStorage.setItem('reminders', JSON.stringify(updated));
  };

  const deleteReminder = async (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
    // TODO: Удалить из Supabase
    const filtered = reminders.filter(r => r.id !== id);
    localStorage.setItem('reminders', JSON.stringify(filtered));
  };

  // ========== COMPANY INFO (LocalStorage for now, TODO: add to Supabase) ==========
  const loadCompanyInfo = async () => {
    const saved = localStorage.getItem('companyInfo');
    if (saved) {
      setCompanyInfo(JSON.parse(saved));
    }
    // TODO: Загрузить из Supabase
  };

  const updateCompanyInfo = async (info: CompanyInfo) => {
    setCompanyInfo(info);
    localStorage.setItem('companyInfo', JSON.stringify(info));
    // TODO: Сохранить в Supabase
  };

  // ========== DOWNLOADABLE FILES (LocalStorage for now, TODO: add to Supabase) ==========
  const loadDownloadableFiles = async () => {
    const saved = localStorage.getItem('downloadableFiles');
    if (saved) {
      setDownloadableFiles(JSON.parse(saved));
    }
    // TODO: Загрузить из Supabase
  };

  const addDownloadableFile = async (file: Omit<DownloadableFile, 'id'>) => {
    const newFile: DownloadableFile = {
      ...file,
      id: Date.now().toString(),
    };
    const updated = [...downloadableFiles, newFile];
    setDownloadableFiles(updated);
    localStorage.setItem('downloadableFiles', JSON.stringify(updated));
    // TODO: Сохранить в Supabase Storage
  };

  const updateDownloadableFile = async (id: string, file: Partial<DownloadableFile>) => {
    const updated = downloadableFiles.map(f => f.id === id ? { ...f, ...file } : f);
    setDownloadableFiles(updated);
    localStorage.setItem('downloadableFiles', JSON.stringify(updated));
    // TODO: Обновить в Supabase
  };

  const deleteDownloadableFile = async (id: string) => {
    const filtered = downloadableFiles.filter(f => f.id !== id);
    setDownloadableFiles(filtered);
    localStorage.setItem('downloadableFiles', JSON.stringify(filtered));
    // TODO: Удалить из Supabase Storage
  };

  return (
    <DataContext.Provider
      value={{
        tenders,
        addTender,
        updateTender,
        deleteTender,
        
        suppliers,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        
        reminders,
        addReminder,
        updateReminder,
        deleteReminder,
        
        expenses,
        getExpensesByTenderId,
        addExpense,
        updateExpense,
        deleteExpense,
        
        companyInfo,
        updateCompanyInfo,
        
        downloadableFiles,
        addDownloadableFile,
        updateDownloadableFile,
        deleteDownloadableFile,
        
        isLoading,
        error,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
