'use client';

import { useState, useEffect } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useRouter } from 'next/navigation';
import { getUserStats, listCauses, type Cause } from '@/lib/api';
import { useNotification } from '@/components/ui/NotificationContext';
import Image from 'next/image';

export default function MarketplacePage() {
  const [causes, setCauses] = useState<Cause[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCredits, setUserCredits] = useState(0);
  const { user } = useAuthenticator();
  const router = useRouter();
  const { showNotification } = useNotification();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Load causes
        const causesList = await listCauses(true); // Only active causes
        setCauses(causesList);

        // Load user data to get credits
        if (user?.userId) {
          const userStats = await getUserStats(user.userId);
          // Available credits is total credits minus used credits
          const availableCredits = userStats.totalCredits - userStats.usedCredits;
          setUserCredits(availableCredits);
        }
      } catch (error) {
        console.error('Error loading marketplace data:', error);
        showNotification('error', 'Yükleme Hatası', 'Veriler yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user, showNotification]);

  function handleDonate(cause: Cause) {
    router.push(`/marketplace/donate?causeId=${cause.id}`);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-green-600">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold leading-6 text-gray-900">Bağış Yap</h1>
          <p className="mt-2 text-sm text-gray-700">
            Puanlarınızla sosyal sorumluluk projelerine destek olun
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none text-right">
          <div className="text-sm text-gray-600">Mevcut Puanınız</div>
          <div className="text-2xl font-semibold text-green-600">{userCredits}</div>
        </div>
      </div>
      
      {causes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600">Henüz bağış yapılacak kurum bulunmamaktadır.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {causes.map((cause) => (
            <div 
              key={cause.id}
              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="p-4">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    {cause.logoUrl ? (
                      <Image
                        src={cause.logoUrl}
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
                
                <p className="text-gray-600 text-sm mb-4">
                  {cause.description}
                </p>
                
                <button
                  onClick={() => handleDonate(cause)}
                  disabled={userCredits < cause.credits}
                  className={`w-full py-2 px-4 rounded-md font-medium text-center 
                    ${userCredits >= cause.credits 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                >
                  {userCredits >= cause.credits 
                    ? 'Bağış Yap' 
                    : `${cause.credits - userCredits} puan daha gerekiyor`}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 