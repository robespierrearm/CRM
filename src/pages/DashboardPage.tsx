import React, { useEffect, useState } from 'react';
import { useData } from '../context/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Calendar, Clock, FileText, Download, Building2, Plus, Copy, Check } from 'lucide-react';
import { formatDateTime } from '../lib/utils';
import { AddTenderDialog } from '../components/AddTenderDialog';

export const DashboardPage: React.FC = () => {
  const { reminders, companyInfo, tenders, downloadableFiles } = useData();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isAddTenderDialogOpen, setIsAddTenderDialogOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const upcomingReminders = reminders
    .filter((r) => !r.completed && new Date(r.dateTime) > new Date())
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
    .slice(0, 5);

  const activeSubmissions = tenders.filter((t) => t.status === 'Новый');
  const winTenders = tenders.filter((t) => t.status === 'Победа' || t.status === 'В работе');

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header with Date/Time and Add Button */}
      <div className="space-y-4">
        <div className="flex items-start md:items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 flex-1">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Дашборд</h1>
              <p className="text-gray-500 mt-1 text-sm md:text-base">Обзор текущей деятельности</p>
            </div>
            
            {/* Date and Time - Desktop */}
            <div className="hidden md:flex items-center gap-4 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">{formatDate(currentTime)}</span>
              </div>
              <div className="w-px h-6 bg-blue-200"></div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-mono font-semibold text-blue-600">{formatTime(currentTime)}</span>
              </div>
            </div>
          </div>

          {/* Add Tender Button */}
          <Button 
            onClick={() => setIsAddTenderDialogOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all whitespace-nowrap"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Добавить тендер</span>
            <span className="sm:hidden">Добавить</span>
          </Button>
        </div>

        {/* Date and Time - Mobile */}
        <div className="md:hidden flex items-center gap-3 px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-blue-600" />
            <span className="text-xs font-medium text-gray-700">{formatDate(currentTime)}</span>
          </div>
          <div className="w-px h-4 bg-blue-200"></div>
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-blue-600" />
            <span className="text-xs font-mono font-semibold text-blue-600">{formatTime(currentTime)}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Активных тендеров</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubmissions.length}</div>
            <p className="text-xs text-muted-foreground">Приём заявок</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Выигранных тендеров</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{winTenders.length}</div>
            <p className="text-xs text-muted-foreground">Победа / В работе</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Напоминаний</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingReminders.length}</div>
            <p className="text-xs text-muted-foreground">Предстоящих</p>
          </CardContent>
        </Card>
      </div>

      {/* Company Info and Reminders - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Info */}
        <Card className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-blue-100 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              Реквизиты компании
            </CardTitle>
            <CardDescription>Основная информация о вашей организации</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Название */}
              <div className="space-y-1">
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Название</span>
                <div className="flex items-center gap-2 group">
                  <p className="text-sm font-semibold text-gray-900 flex-1">{companyInfo.name}</p>
                  <button
                    onClick={() => copyToClipboard(companyInfo.name, 'name')}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-blue-100 rounded"
                    title="Копировать"
                  >
                    {copiedField === 'name' ? (
                      <Check className="h-3.5 w-3.5 text-green-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-blue-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* ИНН и КПП */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">ИНН</span>
                  <div className="flex items-center gap-2 group">
                    <p className="text-sm font-mono font-semibold text-gray-900 flex-1">{companyInfo.inn}</p>
                    <button
                      onClick={() => copyToClipboard(companyInfo.inn, 'inn')}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-blue-100 rounded"
                      title="Копировать"
                    >
                      {copiedField === 'inn' ? (
                        <Check className="h-3.5 w-3.5 text-green-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-blue-600" />
                      )}
                    </button>
                  </div>
                </div>
                {companyInfo.kpp && (
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">КПП</span>
                    <div className="flex items-center gap-2 group">
                      <p className="text-sm font-mono font-semibold text-gray-900 flex-1">{companyInfo.kpp}</p>
                      <button
                        onClick={() => copyToClipboard(companyInfo.kpp!, 'kpp')}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-blue-100 rounded"
                        title="Копировать"
                      >
                        {copiedField === 'kpp' ? (
                          <Check className="h-3.5 w-3.5 text-green-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 text-blue-600" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ОГРН */}
              {companyInfo.ogrn && (
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">ОГРН</span>
                  <div className="flex items-center gap-2 group">
                    <p className="text-sm font-mono font-semibold text-gray-900 flex-1">{companyInfo.ogrn}</p>
                    <button
                      onClick={() => copyToClipboard(companyInfo.ogrn!, 'ogrn')}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-blue-100 rounded"
                      title="Копировать"
                    >
                      {copiedField === 'ogrn' ? (
                        <Check className="h-3.5 w-3.5 text-green-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-blue-600" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Директор */}
              {companyInfo.directorName && (
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Директор</span>
                  <div className="flex items-center gap-2 group">
                    <p className="text-sm font-medium text-gray-900 flex-1">{companyInfo.directorName}</p>
                    <button
                      onClick={() => copyToClipboard(companyInfo.directorName!, 'director')}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-blue-100 rounded"
                      title="Копировать"
                    >
                      {copiedField === 'director' ? (
                        <Check className="h-3.5 w-3.5 text-green-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-blue-600" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Банк и БИК */}
              {(companyInfo.bankName || companyInfo.bik) && (
                <div className="grid grid-cols-2 gap-3">
                  {companyInfo.bankName && (
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Банк</span>
                      <div className="flex items-center gap-2 group">
                        <p className="text-sm font-medium text-gray-900 flex-1 truncate" title={companyInfo.bankName}>{companyInfo.bankName}</p>
                        <button
                          onClick={() => copyToClipboard(companyInfo.bankName!, 'bank')}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-blue-100 rounded flex-shrink-0"
                          title="Копировать"
                        >
                          {copiedField === 'bank' ? (
                            <Check className="h-3.5 w-3.5 text-green-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 text-blue-600" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                  {companyInfo.bik && (
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">БИК</span>
                      <div className="flex items-center gap-2 group">
                        <p className="text-sm font-mono font-semibold text-gray-900 flex-1">{companyInfo.bik}</p>
                        <button
                          onClick={() => copyToClipboard(companyInfo.bik!, 'bik')}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-blue-100 rounded"
                          title="Копировать"
                        >
                          {copiedField === 'bik' ? (
                            <Check className="h-3.5 w-3.5 text-green-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 text-blue-600" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Расчётный счёт */}
              {companyInfo.checkingAccount && (
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Расчётный счёт</span>
                  <div className="flex items-center gap-2 group">
                    <p className="text-sm font-mono font-semibold text-gray-900 flex-1">{companyInfo.checkingAccount}</p>
                    <button
                      onClick={() => copyToClipboard(companyInfo.checkingAccount!, 'checking')}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-blue-100 rounded"
                      title="Копировать"
                    >
                      {copiedField === 'checking' ? (
                        <Check className="h-3.5 w-3.5 text-green-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-blue-600" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Корреспондентский счёт */}
              {companyInfo.correspondentAccount && (
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Корр. счёт</span>
                  <div className="flex items-center gap-2 group">
                    <p className="text-sm font-mono font-semibold text-gray-900 flex-1">{companyInfo.correspondentAccount}</p>
                    <button
                      onClick={() => copyToClipboard(companyInfo.correspondentAccount!, 'correspondent')}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-blue-100 rounded"
                      title="Копировать"
                    >
                      {copiedField === 'correspondent' ? (
                        <Check className="h-3.5 w-3.5 text-green-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-blue-600" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Контакты */}
              {(companyInfo.phone || companyInfo.email) && (
                <div className="grid grid-cols-2 gap-3">
                  {companyInfo.phone && (
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Телефон</span>
                      <div className="flex items-center gap-2 group">
                        <p className="text-sm font-medium text-gray-900 flex-1">{companyInfo.phone}</p>
                        <button
                          onClick={() => copyToClipboard(companyInfo.phone!, 'phone')}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-blue-100 rounded"
                          title="Копировать"
                        >
                          {copiedField === 'phone' ? (
                            <Check className="h-3.5 w-3.5 text-green-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 text-blue-600" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                  {companyInfo.email && (
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Email</span>
                      <div className="flex items-center gap-2 group">
                        <p className="text-sm font-medium text-gray-900 flex-1 truncate" title={companyInfo.email}>{companyInfo.email}</p>
                        <button
                          onClick={() => copyToClipboard(companyInfo.email!, 'email')}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-blue-100 rounded flex-shrink-0"
                          title="Копировать"
                        >
                          {copiedField === 'email' ? (
                            <Check className="h-3.5 w-3.5 text-green-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 text-blue-600" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Reminders */}
        <Card className="border-orange-100 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
              Ближайшие напоминания
            </CardTitle>
            <CardDescription>Предстоящие дедлайны и события</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingReminders.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Нет предстоящих напоминаний</p>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingReminders.map((reminder) => {
                  const tender = tenders.find((t) => t.id === reminder.tenderId);
                  return (
                    <div
                      key={reminder.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 border border-orange-100 hover:shadow-sm transition-all"
                    >
                      <div className="p-1.5 bg-white rounded-md shadow-sm">
                        <Clock className="h-4 w-4 text-orange-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{tender?.name || 'Тендер'}</p>
                        <p className="text-sm text-gray-600 mt-0.5">{reminder.description}</p>
                        <p className="text-xs text-orange-600 font-medium mt-1">
                          {formatDateTime(reminder.dateTime)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Download Files - Compact Block */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <Card className="border-green-100 shadow-sm hover:shadow-md transition-shadow lg:col-span-2 xl:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <div className="p-2 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg">
                <Download className="h-5 w-5 text-white" />
              </div>
              Файлы для скачивания
            </CardTitle>
            <CardDescription>Документы компании</CardDescription>
          </CardHeader>
          <CardContent>
            {downloadableFiles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {downloadableFiles.map((file) => (
                  <a
                    key={file.id}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 hover:shadow-sm hover:border-green-200 transition-all cursor-pointer h-full">
                      <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow flex-shrink-0">
                        <FileText className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-gray-900 group-hover:text-green-700 transition-colors truncate">
                          {file.name}
                        </div>
                        {file.description && (
                          <div className="text-xs text-gray-600 mt-0.5 truncate">{file.description}</div>
                        )}
                        {file.fileType && (
                          <span className="inline-block text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded mt-1">
                            {file.fileType}
                          </span>
                        )}
                      </div>
                      <Download className="h-4 w-4 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Download className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Нет доступных файлов для скачивания</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Tender Dialog */}
      <AddTenderDialog 
        open={isAddTenderDialogOpen} 
        onOpenChange={setIsAddTenderDialogOpen} 
      />
    </div>
  );
};
