'use client';

import {useSearchParams, useRouter} from 'next/navigation';
import {useAuthenticator} from '@aws-amplify/ui-react';
import {useEffect, useState} from 'react';
import {getBin, createScan, getUser, createUser} from '@/lib/api';
import Logo from '@/components/common/Logo';

export default function ScanPage() {
  const searchParams = useSearchParams();
  const binId = searchParams.get('bin');
  const router = useRouter();
  const {authStatus, user} = useAuthenticator();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Geri dönüşüm işlemi doğrulanıyor...');
  const [credits, setCredits] = useState(0);
  const [errorDetails, setErrorDetails] = useState('');

  useEffect(() => {
    // No bin ID provided, redirect to home
    if (!binId) {
      router.push('/');
      return;
    }

    // Not authenticated, store bin ID and redirect to login
    if (authStatus === 'unauthenticated') {
      // Save bin ID in session storage and redirect to login
      sessionStorage.setItem('pendingBinId', binId);
      router.push(`/signin?bin=${binId}`);
      return;
    }

    if (authStatus === 'authenticated' && user) {
      processScan(binId, user.userId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [binId, authStatus, user, router]);

  async function processScan(binId: string, userId: string) {
    try {
      // 1. Get bin details
      const bin = await getBin(binId);
      if (!bin) {
        throw new Error('Geri dönüşüm kutusu bulunamadı.');
      }

      // 2. Check if user exists in database
      const userRecord = await getUser(userId);

      // 3. If user doesn't exist, create a new user record
      if (!userRecord) {
        try {
          // Create user with basic information from Cognito
          await createUser({
            id: userId,
            email: user?.signInDetails?.loginId || '',
            totalCredits: 0,
            name: user?.username || '',
          });
          console.log('Created new user record for:', userId);
        } catch (userCreateError) {
          console.error('Failed to create user record:', userCreateError);
          throw new Error('Kullanıcı kaydı oluşturulamadı. Lütfen daha sonra tekrar deneyin.');
        }
      }

      // 4. Create scan record
      await createScan({
        userId,
        binId,
        binLocation: bin.location,
        credits: bin.credits,
        timestamp: new Date().toISOString(),
      });

      // 5. Update UI
      setCredits(bin.credits);
      setStatus('success');
      setMessage(`Tebrikler! ${bin.credits} puan kazandınız.`);

      // 6. Redirect to dashboard after a delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } catch (error) {
      console.error('Scan processing error:', error);
      setStatus('error');

      // Set appropriate error message based on the error
      if (error instanceof Error) {
        setMessage('Bir hata oluştu: ' + error.message);
        setErrorDetails(error.message);
      } else {
        setMessage('Bir hata oluştu. Lütfen tekrar deneyin.');
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <Logo className="mb-8" width={180} height={60} />

      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full text-center">
        <div className={`text-6xl mb-4 ${status === 'loading' ? 'text-gray-500' : status === 'success' ? 'text-green-500' : 'text-red-500'}`}>
          {status === 'loading' ? '⏳' : status === 'success' ? '✅' : '❌'}
        </div>

        <h1 className="text-2xl font-bold mb-2">{status === 'loading' ? 'İşleminiz Devam Ediyor' : status === 'success' ? 'İşlem Başarılı!' : 'Hata'}</h1>

        <p className="text-gray-600 mb-4">{message}</p>

        {errorDetails && (
          <div className="bg-red-50 p-4 rounded-lg mb-4 text-sm">
            <p className="text-red-800">{errorDetails}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="bg-green-50 p-4 rounded-lg mb-4">
            <p className="text-green-800 font-semibold">+{credits} puan hesabınıza eklendi!</p>
          </div>
        )}

        {status === 'error' && (
          <button
            onClick={() => router.push('/')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Ana Sayfaya Dön
          </button>
        )}
      </div>
    </div>
  );
}
