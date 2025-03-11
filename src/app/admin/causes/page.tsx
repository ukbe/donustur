'use client';

import { useState, useEffect, useCallback } from 'react';
import { TextField, TextAreaField, Button, Flex, View } from '@aws-amplify/ui-react';
import { createCause, listCauses, updateCause, deleteCause, type Cause } from '@/lib/api';
import { useNotification } from '@/components/ui/NotificationContext';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { uploadData, getUrl } from 'aws-amplify/storage';

export default function CausesPage() {
  const [causes, setCauses] = useState<Cause[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCause, setEditingCause] = useState<Cause | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadedFilePath, setUploadedFilePath] = useState<string | null>(null);
  const [signedImageUrls, setSignedImageUrls] = useState<Record<string, string>>({});
  
  const [newCause, setNewCause] = useState({
    name: '',
    description: '',
    logoUrl: '',
    credits: 100,
    status: 'active' as 'active' | 'inactive',
  });
  const { showNotification } = useNotification();
  
  // Use useCallback to memoize the loadCauses function
  const loadCauses = useCallback(async () => {
    // Prevent multiple requests if already loading
    if (loading) return;
    
    setLoading(true);
    try {
      console.log('Loading causes...');
      const causesList = await listCauses();
      console.log('Causes loaded:', causesList);
      setCauses(causesList);
      
      // Load signed URLs for all logos
      const urls: Record<string, string> = {};
      for (const cause of causesList) {
        if (cause.logoUrl) {
          try {
            const { url } = await getUrl({
              path: cause.logoUrl,
              options: {
                bucket: 'donustur-templates',
                expiresIn: 3600,
              }
            });
            urls[cause.logoUrl] = url.toString();
          } catch (e) {
            console.error('Error getting signed URL for', cause.logoUrl, e);
          }
        }
      }
      setSignedImageUrls(urls);
    } catch (error) {
      console.error('Error loading causes:', error);
      setCauses([]); // Set to empty array on error
      
      // Show notification
      showNotification('error', 'Yükleme Hatası', 'Amaçlar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);
  
  useEffect(() => {
    loadCauses();
  }, [loadCauses]);

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      // Create a preview URL
      const objectUrl = URL.createObjectURL(file);
      setLogoPreview(objectUrl);
      
      // Upload file immediately
      handleFileUpload(file);
      
      // Clean up the object URL when the component unmounts
      return () => URL.revokeObjectURL(objectUrl);
    }
  };
  
  // Function to upload logo file to S3
  const handleFileUpload = async (file: File) => {
    if (!file) {
      return;
    }
    
    try {
      const fileName = `uploads/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      
      console.log('Uploading file to S3:', fileName);
      const result = await uploadData({
        path: fileName,
        data: file,
        options: {
          bucket: 'donustur-templates',
          contentType: file.type,
        }
      }).result;
      
      console.log('File uploaded successfully:', result);
      setUploadedFilePath(fileName);
      
      // Get signed URL for preview
      const { url } = await getUrl({
        path: fileName,
        options: {
          bucket: 'donustur-templates',
          expiresIn: 3600,
        }
      });
      
      setLogoPreview(url.toString());
      setSignedImageUrls(prev => ({
        ...prev,
        [fileName]: url.toString()
      }));
    } catch (error) {
      console.error('Error uploading file:', error);
      showNotification('error', 'Yükleme Hatası', 'Dosya yüklenirken bir hata oluştu.');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent duplicate requests
    if (loading) return;
    
    setLoading(true);
    try {
      const logoUrl = uploadedFilePath || newCause.logoUrl;
      
      console.log('Creating new cause with logo:', logoUrl);
      
      // Create cause with generated ID
      const cause = await createCause({
        name: newCause.name,
        description: newCause.description,
        logoUrl: logoUrl,
        credits: newCause.credits,
        status: newCause.status,
      });
      
      // Add the newly created cause to the state
      setCauses(prevCauses => [...prevCauses, cause]);
      
      // Reset form and close modal
      setNewCause({
        name: '',
        description: '',
        logoUrl: '',
        credits: 100,
        status: 'active',
      });
      setLogoPreview(null);
      setUploadedFilePath(null);
      setIsCreating(false);
      
      // Show success notification
      showNotification('success', 'Başarılı', 'Amaç başarıyla oluşturuldu.');
    } catch (error) {
      console.error('Error creating cause:', error);
      
      // Parse and show error
      showNotification('error', 'Oluşturma Hatası', 'Amaç oluşturulurken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Start editing a cause
  const handleEditClick = (cause: Cause) => {
    setEditingCause(cause);
    setLogoPreview(cause.logoUrl ? signedImageUrls[cause.logoUrl] : null);
    setUploadedFilePath(null);
    setIsEditing(true);
  };
  
  // Handle saving edited cause
  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingCause) {
      showNotification('error', 'Hata', 'Düzenlenecek amaç bulunamadı');
      return;
    }
    
    // Prevent duplicate requests
    if (loading) return;
    
    setLoading(true);
    try {
      // Use the uploaded file path if a new file was uploaded, otherwise keep the existing logo URL
      const logoUrl = uploadedFilePath || editingCause.logoUrl;
      
      console.log('Updating cause with logo:', logoUrl);
      
      // Update the cause
      const updatedCause = await updateCause(editingCause.id, {
        name: editingCause.name,
        description: editingCause.description,
        logoUrl: logoUrl,
        credits: editingCause.credits,
        status: editingCause.status,
      });
      
      // Update local state
      setCauses(prevCauses => 
        prevCauses.map(cause => 
          cause.id === updatedCause.id ? updatedCause : cause
        )
      );
      
      // Clean up
      setIsEditing(false);
      setEditingCause(null);
      setLogoPreview(null);
      setUploadedFilePath(null);
      
      // Show success notification
      showNotification('success', 'Başarılı', 'Amaç başarıyla güncellendi');
    } catch (error) {
      console.error('Error updating cause:', error);
      
      // Parse and show error
      showNotification('error', 'Güncelleme Hatası', 'Amaç güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Handle cause status toggle
  const toggleCauseStatus = async (cause: Cause) => {
    // Prevent duplicate requests
    if (loading) return;
    
    setLoading(true);
    try {
      const newStatus = cause.status === 'active' ? 'inactive' : 'active';
      
      console.log(`Changing cause status: ${cause.id} to ${newStatus}`);
      
      // Update the cause status
      const updatedCause = await updateCause(cause.id, { status: newStatus });
      
      // Update local state
      setCauses(prevCauses => 
        prevCauses.map(c => 
          c.id === updatedCause.id ? updatedCause : c
        )
      );
      
      // Show success notification
      showNotification('success', 'Durum Değişikliği', `Amaç ${newStatus === 'active' ? 'aktif' : 'pasif'} olarak işaretlendi`);
    } catch (error) {
      console.error('Error toggling cause status:', error);
      
      // Parse and show error
      showNotification('error', 'Durum Değiştirme Hatası', 'Amaç durumu değiştirilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle delete confirmation
  const handleDeleteConfirm = (causeId: string) => {
    setConfirmDelete(causeId);
  };
  
  // Handle delete cause
  const handleDeleteCause = async (causeId: string) => {
    // Prevent duplicate requests
    if (loading) return;
    
    setLoading(true);
    try {
      console.log('Deleting cause:', causeId);
      
      // Delete the cause
      await deleteCause(causeId);
      
      // Update local state
      setCauses(prevCauses => prevCauses.filter(cause => cause.id !== causeId));
      
      // Reset confirm state
      setConfirmDelete(null);
      
      // Show success notification
      showNotification('success', 'Başarılı', 'Amaç başarıyla silindi');
    } catch (error) {
      console.error('Error deleting cause:', error);
      
      // Parse and show error
      showNotification('error', 'Silme Hatası', 'Amaç silinirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Amaçlar</h1>
          <p className="mt-2 text-sm text-gray-700">
            Kullanıcıların puanlarını kullanabilecekleri amaçları yönetin.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none space-x-3">
          <Button
            onClick={() => loadCauses()}
            backgroundColor="green"
            color="white"
            isLoading={loading}
          >
            Yenile
          </Button>
          <Button
            onClick={() => setIsCreating(true)}
            backgroundColor="green"
            color="white"
            isDisabled={loading}
          >
            Yeni Amaç Ekle
          </Button>
        </div>
      </div>

      {/* Edit Form */}
      {isEditing && editingCause && (
        <View as="form" onSubmit={handleEditSave} className="mb-8 space-y-6 bg-white p-6 rounded-lg shadow">
          <Flex direction="column" gap="1rem">
            <TextField
              label="Amaç Adı"
              name="name"
              placeholder="Amaç adını girin"
              value={editingCause.name}
              onChange={(e) => setEditingCause({ ...editingCause, name: e.target.value })}
              required
              isDisabled={loading}
            />
            
            <TextAreaField
              label="Açıklama"
              name="description"
              placeholder="Amaç açıklamasını girin"
              value={editingCause.description}
              onChange={(e) => setEditingCause({ ...editingCause, description: e.target.value })}
              required
              isDisabled={loading}
            />
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-600 hover:file:bg-green-100"
                disabled={loading}
              />
              {logoPreview && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-1">Önizleme:</p>
                  <div className="w-24 h-24 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                    <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                  </div>
                </div>
              )}
            </div>
            
            <TextField
              label="Puan Değeri"
              name="credits"
              type="number"
              value={editingCause.credits.toString()}
              onChange={(e) => setEditingCause({ ...editingCause, credits: parseInt(e.target.value) || 0 })}
              required
              isDisabled={loading}
            />
            
            <Flex direction="row" gap="1rem" alignItems="center">
              <label className="block text-sm font-medium text-gray-700">Durum</label>
              <select
                value={editingCause.status}
                onChange={(e) => setEditingCause({ ...editingCause, status: e.target.value as 'active' | 'inactive' })}
                className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                disabled={loading}
              >
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
              </select>
            </Flex>
          </Flex>
          
          <Flex justifyContent="flex-end" gap="1rem">
            <Button
              onClick={() => {
                setIsEditing(false);
                setEditingCause(null);
                setLogoPreview(null);
                setUploadedFilePath(null);
              }}
              backgroundColor="white"
              color="black"
              borderColor="gray"
              isDisabled={loading}
            >
              İptal
            </Button>
            <Button
              type="submit"
              backgroundColor="green"
              color="white"
              isLoading={loading}
            >
              Kaydet
            </Button>
          </Flex>
        </View>
      )}

      {/* Create Form */}
      {isCreating && (
        <View as="form" onSubmit={handleCreate} className="mb-8 space-y-6 bg-white p-6 rounded-lg shadow">
          <Flex direction="column" gap="1rem">
            <TextField
              label="Amaç Adı"
              name="name"
              placeholder="Amaç adını girin"
              value={newCause.name}
              onChange={(e) => setNewCause({ ...newCause, name: e.target.value })}
              required
              isDisabled={loading}
            />
            
            <TextAreaField
              label="Açıklama"
              name="description"
              placeholder="Amaç açıklamasını girin"
              value={newCause.description}
              onChange={(e) => setNewCause({ ...newCause, description: e.target.value })}
              required
              isDisabled={loading}
            />
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-600 hover:file:bg-green-100"
                disabled={loading}
              />
              {logoPreview && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-1">Mevcut Logo:</p>
                  <div className="w-24 h-24 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                    <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                  </div>
                </div>
              )}
            </div>
            
            <TextField
              label="Puan Değeri"
              name="credits"
              type="number"
              value={newCause.credits.toString()}
              onChange={(e) => setNewCause({ ...newCause, credits: parseInt(e.target.value) || 0 })}
              required
              isDisabled={loading}
            />
            
            <Flex direction="row" gap="1rem" alignItems="center">
              <label className="block text-sm font-medium text-gray-700">Durum</label>
              <select
                value={newCause.status}
                onChange={(e) => setNewCause({ ...newCause, status: e.target.value as 'active' | 'inactive' })}
                className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                disabled={loading}
              >
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
              </select>
            </Flex>
          </Flex>
          
          <Flex justifyContent="flex-end" gap="1rem">
            <Button
              onClick={() => {
                setIsCreating(false);
                setLogoPreview(null);
                setUploadedFilePath(null);
              }}
              backgroundColor="white"
              color="black"
              borderColor="gray"
              isDisabled={loading}
            >
              İptal
            </Button>
            <Button
              type="submit"
              backgroundColor="green"
              color="white"
              isLoading={loading}
            >
              Oluştur
            </Button>
          </Flex>
        </View>
      )}

      {/* Causes List */}
      <div className="flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Amaç Adı</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Açıklama</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Logo</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Puan</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Durum</th>
                    <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {loading && causes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <svg className="animate-spin h-8 w-8 text-blue-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="text-sm text-gray-500">Yükleniyor...</span>
                        </div>
                      </td>
                    </tr>
                  ) : causes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center">
                        <p className="text-sm text-gray-500">Henüz amaç bulunmuyor.</p>
                      </td>
                    </tr>
                  ) : (
                    causes.map((cause) => (
                      <tr key={cause.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {cause.name}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          <div className="max-h-20 overflow-y-auto">
                            {cause.description}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {cause.logoUrl ? (
                            <div className="relative h-10 w-10">
                              <img 
                                src={signedImageUrls[cause.logoUrl] || ''}
                                alt={cause.name} 
                                className="h-10 w-10 rounded-md object-cover"
                                onError={(e) => {
                                  console.error('Image failed to load');
                                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(cause.name)}&background=random`;
                                }}
                              />
                            </div>
                          ) : (
                            <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center text-gray-500">
                              {cause.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {cause.credits}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <button 
                            onClick={() => toggleCauseStatus(cause)}
                            className={`inline-flex items-center rounded-md ${
                              cause.status === 'active' 
                                ? 'bg-green-50 text-green-700 ring-green-600/20' 
                                : 'bg-red-50 text-red-700 ring-red-600/20'
                            } px-2 py-1 text-xs font-medium ring-1 ring-inset cursor-pointer ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={loading}
                          >
                            {cause.status === 'active' ? 'aktif' : 'pasif'}
                          </button>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          {confirmDelete === cause.id ? (
                            <div className="flex justify-end space-x-2">
                              <Button
                                onClick={() => setConfirmDelete(null)}
                                backgroundColor="white"
                                color="black"
                                border="1px solid #d1d5db"
                                size="small"
                                isDisabled={loading}
                              >
                                İptal
                              </Button>
                              <Button
                                onClick={() => handleDeleteCause(cause.id)}
                                backgroundColor="red"
                                color="white"
                                size="small"
                                isLoading={loading}
                                isDisabled={loading}
                              >
                                Onayla
                              </Button>
                            </div>
                          ) : (
                            <div className="flex justify-end space-x-2">
                              <button
                                type="button"
                                onClick={() => handleEditClick(cause)}
                                className="rounded bg-white p-1 text-gray-400 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={loading}
                              >
                                <PencilIcon className={`h-5 w-5 ${loading ? 'opacity-50' : ''}`} aria-hidden="true" />
                                <span className="sr-only">Düzenle</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteConfirm(cause.id)}
                                className="rounded bg-white p-1 text-gray-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                                disabled={loading}
                              >
                                <TrashIcon className={`h-5 w-5 ${loading ? 'opacity-50' : ''}`} aria-hidden="true" />
                                <span className="sr-only">Sil</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 