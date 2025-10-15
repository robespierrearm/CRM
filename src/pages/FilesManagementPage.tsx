import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import { Card, CardContent } from '../components/ui/card';
import { Plus, Trash2, Edit, FileText, Download, Upload } from 'lucide-react';
import { DownloadableFile } from '../types';

export const FilesManagementPage: React.FC = () => {
  const { downloadableFiles, addDownloadableFile, updateDownloadableFile, deleteDownloadableFile } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<DownloadableFile | null>(null);
  const [formData, setFormData] = useState<Partial<DownloadableFile>>({
    name: '',
    description: '',
    url: '',
    fileType: '',
  });

  const handleOpenDialog = (file?: DownloadableFile) => {
    if (file) {
      setEditingFile(file);
      setFormData(file);
    } else {
      setEditingFile(null);
      setFormData({
        name: '',
        description: '',
        url: '',
        fileType: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingFile(null);
    setFormData({
      name: '',
      description: '',
      url: '',
      fileType: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.url) {
      alert('Пожалуйста, заполните обязательные поля');
      return;
    }

    const fileData = {
      ...formData,
      uploadDate: new Date().toISOString(),
    } as Omit<DownloadableFile, 'id'>;

    if (editingFile) {
      updateDownloadableFile(editingFile.id, fileData);
    } else {
      addDownloadableFile(fileData);
    }

    handleCloseDialog();
  };

  const handleDelete = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этот файл?')) {
      deleteDownloadableFile(id);
    }
  };

  const getFileIcon = (_fileType: string) => {
    return <FileText className="h-5 w-5" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Управление файлами</h1>
          <p className="text-gray-500 mt-1">Загрузка файлов для скачивания на дашборде</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить файл
        </Button>
      </div>

      {/* Files Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {downloadableFiles.map((file) => (
          <Card key={file.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getFileIcon(file.fileType)}
                  <div>
                    <h3 className="font-semibold text-sm">{file.name}</h3>
                    <p className="text-xs text-gray-500">{file.fileType}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleOpenDialog(file)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  {!file.isDefault && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-500"
                      onClick={() => handleDelete(file.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
              
              <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                {file.description}
              </p>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{new Date(file.uploadDate).toLocaleDateString('ru-RU')}</span>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                >
                  <Download className="h-3 w-3" />
                  Скачать
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {downloadableFiles.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <Upload className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>Нет загруженных файлов</p>
            <p className="text-sm mt-1">Добавьте файлы для отображения на дашборде</p>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingFile ? 'Редактировать файл' : 'Добавить файл'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Название файла <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Например: Инструкция по работе"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Описание</label>
              <Input
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Краткое описание файла"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Ссылка на файл <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.url || ''}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://example.com/file.pdf"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Укажите прямую ссылку на файл (Google Drive, Dropbox, и т.д.)
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Тип файла</label>
              <Input
                value={formData.fileType || ''}
                onChange={(e) => setFormData({ ...formData, fileType: e.target.value })}
                placeholder="PDF, DOCX, XLSX и т.д."
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Отмена
              </Button>
              <Button type="submit">
                {editingFile ? 'Сохранить' : 'Добавить'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
