'use client';

import {useAuthenticator} from '@aws-amplify/ui-react';
import {useEffect, useState} from 'react';
import {QRCodeSVG} from 'qrcode.react';
import {getUserById} from '@/lib/api';

export default function QRCodePage() {
  const {user} = useAuthenticator();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    async function fetchUserData() {
      if (user?.userId) {
        try {
          const userData = await getUserById(user.userId);
          if (userData) {
            setUserName(userData.email || userData.name || user.signInDetails?.loginId || '');
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
          setError('Kullanıcı bilgileri alınamadı.');
        } finally {
          setLoading(false);
        }
      }
    }

    fetchUserData();
  }, [user]);

  // Create QR code URL with user ID
  const qrCodeData = user?.userId ? `${window.location.origin}/scan?user=${user.userId}` : '';

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6 md:p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">QR Kodum</h1>
          <p className="mt-2 text-sm text-gray-600">Bu QR kodu geri dönüşüm kutularında kimlik doğrulama için kullanın.</p>
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-pulse text-green-600">Yükleniyor...</div>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-lg mb-4">
            <p className="text-red-800">{error}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="p-4 bg-white rounded-lg border-2 border-gray-200 shadow-sm">
              {qrCodeData ? (
                <QRCodeSVG value={qrCodeData} size={280} level="H" includeMargin={true} bgColor="#FFFFFF" fgColor="#000000" />
              ) : (
                <p className="text-red-500">QR kod oluşturulamadı</p>
              )}
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm font-medium text-gray-700">Kullanıcı: {userName}</p>
              <p className="text-xs text-gray-500 mt-1">ID: {user?.userId}</p>
            </div>

            <div className="mt-8 w-full">
              <p className="text-sm text-gray-700 mb-2 font-medium">Nasıl kullanılır:</p>
              <ol className="text-sm text-gray-600 list-decimal pl-5 space-y-1">
                <li>Bu QR kodunu geri dönüşüm kutusu üzerindeki tarayıcıya okutun</li>
                <li>Geri dönüşüm kutusunu kullanın</li>
                <li>İşlem tamamlandığında puanlarınız otomatik olarak hesabınıza eklenecektir</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
