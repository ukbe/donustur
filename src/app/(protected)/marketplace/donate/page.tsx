'use client';

import { useState, useEffect } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCause, getUserStats, redeemForCause, type Cause } from '@/lib/api';
import { useNotification } from '@/components/ui/NotificationContext';
import Image from 'next/image';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { getUrl } from 'aws-amplify/storage';

export default function DonatePage() {
  const [cause, setCause] = useState<Cause | null>(null);
  const [userCredits, setUserCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const causeId = searchParams.get('causeId');
  const { user } = useAuthenticator();
  const router = useRouter();
  const { showNotification } = useNotification();

  useEffect(() => {
    async function loadData() {
      if (!causeId || !user?.userId) {
        router.push('/marketplace');
        return;
      }

      setLoading(true);
      try {
        // Load cause data
        const causeData = await getCause(causeId);
        if (!causeData) {
          router.push('/marketplace');
          return;
        }
        setCause(causeData);

        // Get signed URL for logo if available
        if (causeData.logoUrl) {
          try {
            const { url } = await getUrl({
              path: causeData.logoUrl,
              options: {
                bucket: 'donustur-templates',
                expiresIn: 3600,
              }
            });
            setLogoUrl(url.toString());
          } catch (e) {
            console.error('Error getting signed URL for logo:', e);
          }
        }

        // Load user data to get credits
        const userStats = await getUserStats(user.userId);
        // Available credits is total credits minus used credits
        const availableCredits = userStats.totalCredits - userStats.usedCredits;
        setUserCredits(availableCredits);
      } catch (error) {
        console.error('Error loading donation data:', error);
        showNotification('error', 'Yükleme Hatası', 'Veriler yüklenirken bir hata oluştu.');
        router.push('/marketplace');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [causeId, user, router, showNotification]);

  async function handleDonate() {
    if (!cause || !user?.userId || processing) return;

    if (userCredits < cause.credits) {
      showNotification('error', 'Yetersiz Puan', 'Bu bağışı yapmak için yeterli puanınız bulunmamaktadır.');
      return;
    }

    setProcessing(true);
    try {
      await redeemForCause(user.userId, cause.id, cause.credits);
      
      // Set success state
      setSucceeded(true);
      setProcessing(false);
      
      showNotification('success', 'Bağış Başarılı', `${cause.name} kurumuna ${cause.credits} puan bağışladınız.`);
      
      // Update local state
      setUserCredits(prevCredits => prevCredits - cause.credits);
      
      // Redirect to dashboard after short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } catch (error) {
      console.error('Error processing donation:', error);
      let errorMessage = 'Bağış işlemi sırasında bir hata oluştu.';
      
      if (error instanceof Error) {
        if (error.message.includes('Insufficient credits')) {
          errorMessage = 'Yetersiz puan. Bağış yapılamadı.';
        }
      }
      
      showNotification('error', 'Bağış Hatası', errorMessage);
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-green-600">Yükleniyor...</div>
      </div>
    );
  }

  if (!cause) {
    return null;
  }

  const canDonate = userCredits >= cause.credits;

  // Display success message if donation was successful
  if (succeeded) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-100 max-w-2xl mx-auto p-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-green-100 p-3">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Bağış Başarılı!</h1>
          <p className="text-gray-600 mb-6">
            {cause?.name} kurumuna {cause?.credits} puan bağışı yaptınız. Desteğiniz için teşekkür ederiz.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Kontrol panelinize yönlendiriliyorsunuz...
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Panele Git
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <button 
        onClick={() => router.back()}
        className="flex items-center text-green-600 mb-6 hover:text-green-700"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-1" />
        Geri Dön
      </button>
      
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-100 max-w-2xl mx-auto">
        <div className="p-6">
          <h1 className="text-xl font-semibold leading-6 text-gray-900 mb-4">Bağış Onayı</h1>
          
          <div className="flex items-center mb-6 border-b border-gray-100 pb-6">
            <div className="w-16 h-16 rounded-md overflow-hidden  flex items-center justify-center">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={cause.name}
                  width={64}
                  height={64}
                />
              ) : (
                <div className="text-3xl text-green-600">
                  {cause.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-gray-900">{cause.name}</h2>
              <div className="flex items-center">
                <span className="text-green-600 font-medium">{cause.credits} puan</span>
              </div>
            </div>
          </div>
          
          <p className="text-gray-700 mb-6">{cause.description}</p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Bağış Miktarı:</span>
              <span className="font-semibold">{cause.credits} puan</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Mevcut Puanınız:</span>
              <span className="font-semibold">{userCredits} puan</span>
            </div>
            {!canDonate && (
              <div className="mt-2 text-red-500 text-sm">
                Bu bağışı yapmak için {cause.credits - userCredits} puan daha toplamanız gerekiyor.
              </div>
            )}
          </div>
          
          <button
            onClick={handleDonate}
            disabled={!canDonate || processing}
            className={`w-full py-3 px-4 rounded-md font-medium text-center 
              ${canDonate 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
          >
            {processing 
              ? 'İşleniyor...' 
              : canDonate 
                ? 'Bağışı Onayla' 
                : 'Yetersiz Puan'}
          </button>
        </div>
      </div>
    </div>
  );
} 