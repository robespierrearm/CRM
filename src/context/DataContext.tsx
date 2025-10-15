import React, { createContext, useContext, useState, useEffect } from 'react';
import { Tender, Supplier, Reminder, AccountingEntry, CompanyInfo, DownloadableFile } from '../types';

interface DataContextType {
  tenders: Tender[];
  suppliers: Supplier[];
  reminders: Reminder[];
  accountingEntries: AccountingEntry[];
  companyInfo: CompanyInfo;
  downloadableFiles: DownloadableFile[];
  addTender: (tender: Omit<Tender, 'id'>) => Tender;
  updateTender: (id: string, tender: Partial<Tender>) => void;
  deleteTender: (id: string) => void;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  addReminder: (reminder: Omit<Reminder, 'id'>) => void;
  updateReminder: (id: string, reminder: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  updateAccountingEntry: (entry: AccountingEntry) => void;
  updateCompanyInfo: (info: CompanyInfo) => void;
  addDownloadableFile: (file: Omit<DownloadableFile, 'id'>) => void;
  updateDownloadableFile: (id: string, file: Partial<DownloadableFile>) => void;
  deleteDownloadableFile: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};

const defaultCompanyInfo: CompanyInfo = {
  name: 'ООО "Название компании"',
  inn: '1234567890',
  kpp: '',
  ogrn: '',
  bankName: '',
  bik: '',
  checkingAccount: '',
  correspondentAccount: '',
  directorName: '',
  phone: '',
  email: '',
  address: '',
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Инициализируем состояние данными из localStorage
  const [tenders, setTenders] = useState<Tender[]>(() => {
    const saved = localStorage.getItem('tenders');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('suppliers');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const saved = localStorage.getItem('reminders');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [accountingEntries, setAccountingEntries] = useState<AccountingEntry[]>(() => {
    const saved = localStorage.getItem('accountingEntries');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(() => {
    const saved = localStorage.getItem('companyInfo');
    return saved ? JSON.parse(saved) : defaultCompanyInfo;
  });
  
  const [downloadableFiles, setDownloadableFiles] = useState<DownloadableFile[]>(() => {
    const saved = localStorage.getItem('downloadableFiles');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('tenders', JSON.stringify(tenders));
  }, [tenders]);

  useEffect(() => {
    localStorage.setItem('suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem('accountingEntries', JSON.stringify(accountingEntries));
  }, [accountingEntries]);

  useEffect(() => {
    localStorage.setItem('companyInfo', JSON.stringify(companyInfo));
  }, [companyInfo]);

  useEffect(() => {
    localStorage.setItem('downloadableFiles', JSON.stringify(downloadableFiles));
  }, [downloadableFiles]);

  const addTender = (tender: Omit<Tender, 'id'>): Tender => {
    const newTender = { ...tender, id: Date.now().toString() };
    setTenders([...tenders, newTender]);
    return newTender;
  };

  const updateTender = (id: string, tenderUpdate: Partial<Tender>) => {
    const oldTender = tenders.find(t => t.id === id);
    const updatedTender = { ...oldTender, ...tenderUpdate } as Tender;
    
    setTenders(tenders.map(t => (t.id === id ? updatedTender : t)));
    
    // Автоматическое управление напоминаниями
    if (oldTender) {
      // Если статус изменился с "Новый" на "Подано" или "Рассмотрение", удаляем напоминание
      if (oldTender.status === 'Новый' && (updatedTender.status === 'Подано' || updatedTender.status === 'Рассмотрение')) {
        const reminder = reminders.find(r => r.tenderId === id);
        if (reminder) {
          setReminders(reminders.filter(r => r.id !== reminder.id));
        }
      }
    }
  };

  const deleteTender = (id: string) => {
    setTenders(tenders.filter(t => t.id !== id));
  };

  const addSupplier = (supplier: Omit<Supplier, 'id'>) => {
    const newSupplier = { ...supplier, id: Date.now().toString() };
    setSuppliers([...suppliers, newSupplier]);
  };

  const updateSupplier = (id: string, supplier: Partial<Supplier>) => {
    setSuppliers(suppliers.map(s => (s.id === id ? { ...s, ...supplier } : s)));
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(suppliers.filter(s => s.id !== id));
  };

  const addReminder = (reminder: Omit<Reminder, 'id'>) => {
    const newReminder = { ...reminder, id: Date.now().toString() };
    setReminders([...reminders, newReminder]);
  };

  const updateReminder = (id: string, reminder: Partial<Reminder>) => {
    setReminders(reminders.map(r => (r.id === id ? { ...r, ...reminder } : r)));
  };

  const deleteReminder = (id: string) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  const updateAccountingEntry = (entry: AccountingEntry) => {
    const existing = accountingEntries.find(e => e.tenderId === entry.tenderId);
    if (existing) {
      setAccountingEntries(
        accountingEntries.map(e => (e.tenderId === entry.tenderId ? entry : e))
      );
    } else {
      setAccountingEntries([...accountingEntries, entry]);
    }
  };

  const updateCompanyInfo = (info: CompanyInfo) => {
    setCompanyInfo(info);
  };

  const addDownloadableFile = (file: Omit<DownloadableFile, 'id'>) => {
    const newFile = { ...file, id: Date.now().toString() };
    setDownloadableFiles([...downloadableFiles, newFile]);
  };

  const updateDownloadableFile = (id: string, file: Partial<DownloadableFile>) => {
    setDownloadableFiles(downloadableFiles.map(f => (f.id === id ? { ...f, ...file } : f)));
  };

  const deleteDownloadableFile = (id: string) => {
    setDownloadableFiles(downloadableFiles.filter(f => f.id !== id));
  };

  return (
    <DataContext.Provider
      value={{
        tenders,
        suppliers,
        reminders,
        accountingEntries,
        companyInfo,
        downloadableFiles,
        addTender,
        updateTender,
        deleteTender,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        addReminder,
        updateReminder,
        deleteReminder,
        updateAccountingEntry,
        updateCompanyInfo,
        addDownloadableFile,
        updateDownloadableFile,
        deleteDownloadableFile,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
