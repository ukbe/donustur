'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { TextField, Button, Flex, View } from '@aws-amplify/ui-react';
import { createBin, listBins, updateBin, deleteBin, type Bin } from '@/lib/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useNotification } from '@/components/ui/NotificationContext';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

// Define GraphQL error type
interface GraphQLError {
  errorType: string;
  message: string;
}

export default function BinsPage() {
  const [bins, setBins] = useState<Bin[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingBin, setEditingBin] = useState<Bin | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [newBin, setNewBin] = useState({
    name: '',
    location: '',
    credits: 10,
  });
  const { showNotification } = useNotification();
  
  useEffect(() => {
    loadBins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  async function loadBins() {
    // Prevent duplicate requests
    if (loading) return;
    
    setLoading(true);
    try {
      console.log('Loading bins...');
      const binsList = await listBins();
      console.log('Bins loaded:', binsList);
      setBins(binsList);
    } catch (error) {
      console.error('Error loading bins:', error);
      setBins([]); // Set to empty array on error
      
      // Handle GraphQL error format directly if present
      if (typeof error === 'object' && error !== null && 'errors' in error) {
        const errorObj = error as { errors?: Array<{errorType?: string; message?: string}> };
        console.log('Direct GraphQL error detected in loadBins:', errorObj);
      }
      
      // Show notification
      showNotification('error', 'Yükleme Hatası', 'Geri dönüşüm kutuları yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent duplicate requests
    if (loading) return;
    
    setLoading(true);
    try {
      console.log('Creating new bin:', newBin);
      
      // Generate a UUID for the bin
      const binId = uuidv4();
      
      // Create bin with generated ID
      const bin = await createBin({
        id: binId,
        name: newBin.name,
        location: newBin.location,
        credits: newBin.credits,
        status: 'active' as const,
      });
      
      // Add the newly created bin to the state
      setBins(prevBins => [...prevBins, bin]);
      
      // Reset form and close modal
      setNewBin({
        name: '',
        location: '',
        credits: 10,
      });
      setIsCreating(false);
      
      // Show success notification
      showNotification('success', 'Başarılı', 'Geri dönüşüm kutusu başarıyla oluşturuldu.');
      
      // Generate QR code PDF for the new bin
      await generateQRPDF(bin);
    } catch (error) {
      console.error('Error creating bin:', error);
      
      // Parse and show error
      const errorMessage = parseError(error);
      showNotification('error', 'Oluşturma Hatası', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to parse errors
  const parseError = (error: unknown): string => {
    let errorMessage = 'Bilinmeyen bir hata oluştu';
    
    console.log('Parsing error:', error);
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // First check if the error is directly in the expected format
      if (error.message.includes('UnauthorizedException') || error.message.includes('Permission denied')) {
        return 'Bu işlemi gerçekleştirmek için gerekli izinlere sahip değilsiniz. Lütfen yönetici hesabıyla giriş yaptığınızdan emin olun.';
      }
      
      // Check for GraphQL errors in the JSON
      if (typeof errorMessage === 'string' && (
          errorMessage.includes('errors') || 
          errorMessage.includes('"errorType"')
        )) {
        try {
          const errorJson = JSON.parse(errorMessage);
          if (errorJson.errors && errorJson.errors.length > 0) {
            const errors = errorJson.errors as GraphQLError[];
            errorMessage = errors.map(e => 
              `${e.errorType}: ${e.message}`
            ).join(', ');
            
            // Special messages for common errors
            if (errorMessage.includes('Permission denied') || errorMessage.includes('UnauthorizedException')) {
              errorMessage = 'Bu işlemi gerçekleştirmek için gerekli izinlere sahip değilsiniz. Lütfen yönetici hesabıyla giriş yaptığınızdan emin olun.';
            }
          }
        } catch {
          // If parsing fails, keep the original message
        }
      }
    } else if (typeof error === 'object' && error !== null) {
      // Handle cases where the error is directly an object with errors property
      interface ErrorObjectWithErrors {
        errors?: Array<{errorType?: string; message?: string}>;
      }
      
      const errorObj = error as ErrorObjectWithErrors;
      if (errorObj.errors && Array.isArray(errorObj.errors)) {
        const errors = errorObj.errors;
        if (errors.length > 0) {
          errorMessage = errors.map(e => 
            `${e.errorType || 'Error'}: ${e.message || 'Unknown error'}`
          ).join(', ');
          
          if (errorMessage.includes('Permission denied') || errorMessage.includes('UnauthorizedException')) {
            errorMessage = 'Bu işlemi gerçekleştirmek için gerekli izinlere sahip değilsiniz. Lütfen yönetici hesabıyla giriş yaptığınızdan emin olun.';
          }
        }
      }
    }
    
    return errorMessage;
  };

  const generateQRPDF = async (bin: Bin) => {
    if (!bin) {
      console.error('Cannot generate PDF: Bin is null');
      return;
    }
    
    // Prevent duplicate requests
    if (loading) return;
    
    setLoading(true);
    try {
      // First get the logo as a data URL
      const logoUrl = '/donustur.png'; // Assuming logo is in public folder
      let logoDataUrl = '';
      
      try {
        // Create a temporary image element to load the logo
        const img = document.createElement('img');
        img.crossOrigin = 'anonymous';
        img.src = logoUrl;
        
        // Wait for the image to load
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        
        // Convert to data URL
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        logoDataUrl = canvas.toDataURL('image/png');
      } catch (err) {
        console.error('Error loading logo:', err);
        // Continue without logo if loading fails
      }
      
      // Create a temporary visible div for rendering
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '500px';
      tempDiv.style.height = '750px'; // Increase height to fit everything
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.padding = '0';
      document.body.appendChild(tempDiv);
      
      // Create QR code content with better styling and logo
      const cleanQrUrl = new URL(`/scan?bin=${bin.id}`, window.location.origin).toString();
      
      tempDiv.innerHTML = `
        <div style="width: 100%; height: 100%; position: relative; font-family: Arial, sans-serif;">
          <!-- Header section with green background -->
          <div style="color: gray; padding: 20px; text-align: center;">
            ${logoDataUrl ? `
              <!-- Logo -->
              <div style="margin-bottom: 8px; display: flex; justify-content: center;">
                <img src="${logoDataUrl}" alt="Dönüştür Logo" style="height: 50px; max-width: 80%; object-fit: contain;" />
              </div>
            ` : `
              <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Dönüştür</h1>
            `}
            <p style="margin: 5px 0 0 0; font-size: 16px;">Geri Dönüşüm Kutusu</p>
          </div>
          
          <!-- Content section -->
          <div style="padding: 25px; background-color: white;">
            <!-- Bin info section -->
            <div style="margin-bottom: 25px; align-items: center; text-align: center;">
              <p style="margin: 8px 0; font-size: 18px;"><span style="font-weight: bold; color: #334155;">Kutu Adı:</span> ${bin.name || 'Isimsiz'}</p>
              <p style="margin: 8px 0; font-size: 18px;"><span style="font-weight: bold; color: #334155;">Konum:</span> ${bin.location || 'Belirtilmemiş'}</p>
              <p style="margin: 8px 0; font-size: 18px;"><span style="font-weight: bold; color: #334155;">Puan Değeri:</span> ${bin.credits || 0}</p>
              <p style="margin: 8px 0; font-size: 14px; color: #6b7280;"><span style="font-weight: bold;">Kutu ID:</span> ${bin.id}</p>
            </div>
            
            <!-- QR Code section -->
            <div style="display: flex; flex-direction: column; align-items: center; margin: 20px 0;">
              <p style="margin: 0 0 15px 0; font-size: 16px; font-weight: bold; color: #334155;">Bu QR kodu taratarak geri dönüşüm yapın</p>
              <div id="qr-code-container" style="background-color: white; padding: 15px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"></div>
            </div>
            
            <!-- Manual URL section with fixed small font size -->
            <div style="margin-top: 25px; text-align: center; padding: 10px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #334155;">Alternatif Manuel Giriş</p>
              
              <!-- URL with fixed small font -->
              <div style="background-color: #e0f2fe; padding: 10px; border-radius: 4px; text-align: center; overflow: hidden; white-space: nowrap;">
                <a href="${cleanQrUrl}" style="font-family: 'Courier New', monospace; height: 20px; font-size: 10px; color: #0f172a; font-weight: bold; text-decoration: none; display: inline-block; max-width: 100%; overflow: auto; white-space: nowrap;">${cleanQrUrl}</a>
              </div>
              
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #64748b;">Yukarıdaki linki tarayıcınıza kopyalayın veya tıklayın.</p>
            </div>
            
            <!-- Footer -->
            <div style="margin-top: 30px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px;">
              <p style="margin: 0; font-size: 14px; color: #9ca3af;">Bu QR kod ${new Date().toLocaleDateString('tr-TR')} tarihinde oluşturulmuştur</p>
            </div>
          </div>
        </div>
      `;
      
      // 4. Create and add the QR code image directly (as PNG not SVG)
      const qrContainer = tempDiv.querySelector('#qr-code-container');
      const qrCanvas = document.createElement('canvas');
      qrCanvas.width = 200;
      qrCanvas.height = 200;
      qrContainer?.appendChild(qrCanvas);
      
      // Create QR code directly on canvas
      const qr = await import('qrcode');
      await qr.toCanvas(qrCanvas, cleanQrUrl, {
        width: 200,
        margin: 0,
        color: {
          dark: '#000000',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H'
      });
      
      // 5. Let the browser render the content
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 6. Capture the element to canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: true,
        backgroundColor: 'white',
        height: tempDiv.offsetHeight, // Ensure full height is captured
        windowHeight: tempDiv.offsetHeight
      });
      
      // 7. Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      // Calculate dimensions to fit on A4 while preserving aspect ratio
      const a4Width = 210; // A4 width in mm
      const margin = 10; // margins in mm
      
      const contentWidth = a4Width - (margin * 2);
      const imgAspectRatio = canvas.height / canvas.width;
      const contentHeight = contentWidth * imgAspectRatio;
      
      // Add QR code image - centered and scaled to fit
      pdf.addImage(
        imgData, 
        'PNG', 
        margin, // x position (left margin)
        margin, // y position (top margin)
        contentWidth, // width
        contentHeight // height
      );
      
      // 8. Save and cleanup
      const safeName = bin.name ? bin.name.replace(/\s+/g, '-') : 'unnamed-bin';
      pdf.save(`donustur-qr-${safeName}.pdf`);
      document.body.removeChild(tempDiv);
      
      showNotification('success', 'Başarılı', 'QR kod PDF olarak indirildi');
    } catch (error) {
      console.error('Error generating PDF:', error);
      showNotification('error', 'PDF Oluşturma Hatası', 'QR kod PDF dosyası oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Start editing a bin
  const handleEditClick = (bin: Bin) => {
    setEditingBin(bin);
    setIsEditing(true);
  };
  
  // Handle saving edited bin
  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingBin) {
      showNotification('error', 'Hata', 'Düzenlenecek kutu bulunamadı');
      return;
    }
    
    // Prevent duplicate requests
    if (loading) return;
    
    setLoading(true);
    try {
      console.log('Updating bin:', editingBin);
      
      // Update the bin
      const updatedBin = await updateBin(editingBin.id, {
        name: editingBin.name,
        location: editingBin.location,
        credits: editingBin.credits,
      });
      
      // Update local state
      setBins(prevBins => 
        prevBins.map(bin => 
          bin.id === updatedBin.id ? updatedBin : bin
        )
      );
      
      // Close edit form
      setIsEditing(false);
      setEditingBin(null);
      
      // Show success notification
      showNotification('success', 'Başarılı', 'Geri dönüşüm kutusu başarıyla güncellendi');
    } catch (error) {
      console.error('Error updating bin:', error);
      
      // Parse and show error
      const errorMessage = parseError(error);
      showNotification('error', 'Güncelleme Hatası', errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle bin status toggle
  const toggleBinStatus = async (bin: Bin) => {
    // Prevent duplicate requests
    if (loading) return;
    
    setLoading(true);
    try {
      const newStatus = bin.status === 'active' ? 'inactive' : 'active';
      
      console.log(`Changing bin status: ${bin.id} to ${newStatus}`);
      
      // Update the bin status
      const updatedBin = await updateBin(bin.id, { status: newStatus });
      
      // Update local state
      setBins(prevBins => 
        prevBins.map(b => 
          b.id === updatedBin.id ? updatedBin : b
        )
      );
      
      // Show success notification
      showNotification('success', 'Durum Değişikliği', `Kutu ${newStatus === 'active' ? 'aktif' : 'pasif'} olarak işaretlendi`);
    } catch (error) {
      console.error('Error toggling bin status:', error);
      
      // Parse and show error
      const errorMessage = parseError(error);
      showNotification('error', 'Durum Değiştirme Hatası', errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle delete confirmation
  const handleDeleteConfirm = (binId: string) => {
    setConfirmDelete(binId);
  };
  
  // Handle delete bin
  const handleDeleteBin = async (binId: string) => {
    // Prevent duplicate requests
    if (loading) return;
    
    setLoading(true);
    try {
      console.log('Deleting bin:', binId);
      
      // Delete the bin
      await deleteBin(binId);
      
      // Update local state
      setBins(prevBins => prevBins.filter(bin => bin.id !== binId));
      
      // Reset confirm state
      setConfirmDelete(null);
      
      // Show success notification
      showNotification('success', 'Başarılı', 'Geri dönüşüm kutusu başarıyla silindi');
    } catch (error) {
      console.error('Error deleting bin:', error);
      
      // Parse and show error
      const errorMessage = parseError(error);
      showNotification('error', 'Silme Hatası', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Geri Dönüşüm Kutuları</h1>
          <p className="mt-2 text-sm text-gray-700">
            Geri dönüşüm kutularını yönetin ve QR kodlarını indirin.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none space-x-3">
          <Button
            onClick={() => loadBins()}
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
            Yeni Kutu Ekle
          </Button>
        </div>
      </div>

      {/* Edit Form */}
      {isEditing && editingBin && (
        <View as="form" onSubmit={handleEditSave} className="mb-8 space-y-6 bg-white p-6 rounded-lg shadow">
          <Flex direction="column" gap="1rem">
            <TextField
              label="Kutu Adı"
              name="name"
              required
              value={editingBin.name || ''}
              onChange={(e) => setEditingBin({...editingBin, name: e.target.value})}
            />
            <TextField
              label="Konum"
              name="location"
              required
              value={editingBin.location || ''}
              onChange={(e) => setEditingBin({...editingBin, location: e.target.value})}
            />
            <TextField
              label="Puan Değeri"
              name="credits"
              type="number"
              required
              value={editingBin.credits}
              onChange={(e) => setEditingBin({...editingBin, credits: parseInt(e.target.value, 10)})}
            />
            <Flex justifyContent="flex-end" gap="0.5rem">
              <Button
                onClick={() => {
                  setIsEditing(false);
                  setEditingBin(null);
                }}
                backgroundColor="transparent"
                color="black"
              >
                İptal
              </Button>
              <Button type="submit" backgroundColor="green" color="white" isLoading={loading}>
                Güncelle
              </Button>
            </Flex>
          </Flex>
        </View>
      )}

      {/* Create Form */}
      {isCreating && (
        <View as="form" onSubmit={handleCreate} className="mb-8 space-y-6 bg-white p-6 rounded-lg shadow">
          <Flex direction="column" gap="1rem">
            <TextField
              label="Kutu Adı"
              name="name"
              required
              value={newBin.name}
              onChange={(e) => setNewBin({...newBin, name: e.target.value})}
            />
            <TextField
              label="Konum"
              name="location"
              required
              value={newBin.location}
              onChange={(e) => setNewBin({...newBin, location: e.target.value})}
            />
            <TextField
              label="Puan Değeri"
              name="credits"
              type="number"
              required
              value={newBin.credits}
              onChange={(e) => setNewBin({...newBin, credits: parseInt(e.target.value, 10)})}
            />
            <Flex justifyContent="flex-end" gap="0.5rem">
              <Button
                onClick={() => setIsCreating(false)}
                backgroundColor="transparent"
                color="black"
              >
                İptal
              </Button>
              <Button type="submit" backgroundColor="green" color="white" isLoading={loading}>
                Kaydet
              </Button>
            </Flex>
          </Flex>
        </View>
      )}

      {/* Bins List */}
      <div className="flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Kutu Adı</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Konum</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Puan</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Durum</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">QR Kod</th>
                    <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {loading && bins.length === 0 ? (
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
                  ) : bins.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center">
                        <p className="text-sm text-gray-500">Henüz geri dönüşüm kutusu bulunmuyor.</p>
                      </td>
                    </tr>
                  ) : (
                    bins.map((bin) => bin && (
                      <tr key={bin.id || 'unknown'}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {bin.name || 'Isimsiz'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {bin.location || 'Belirtilmemiş'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {bin.credits ?? 0}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <button 
                            onClick={() => toggleBinStatus(bin)}
                            className={`inline-flex items-center rounded-md ${
                              bin.status === 'active' 
                                ? 'bg-green-50 text-green-700 ring-green-600/20' 
                                : 'bg-red-50 text-red-700 ring-red-600/20'
                            } px-2 py-1 text-xs font-medium ring-1 ring-inset cursor-pointer ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={loading}
                          >
                            {bin.status === 'active' ? 'aktif' : 'pasif'}
                          </button>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <Button
                            onClick={() => bin && generateQRPDF(bin)}
                            backgroundColor="white"
                            color="black"
                            border="1px solid #d1d5db"
                            isLoading={loading}
                            isDisabled={loading}
                          >
                            QR PDF İndir
                          </Button>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          {confirmDelete === bin.id ? (
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
                                onClick={() => handleDeleteBin(bin.id)}
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
                                onClick={() => handleEditClick(bin)}
                                className="rounded bg-white p-1 text-gray-400 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={loading}
                              >
                                <PencilIcon className={`h-5 w-5 ${loading ? 'opacity-50' : ''}`} aria-hidden="true" />
                                <span className="sr-only">Düzenle</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteConfirm(bin.id)}
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