'use client';

import { useAuthenticator } from '@aws-amplify/ui-react';
import { QrCodeIcon, ArrowTrendingUpIcon, GiftIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { getUserActivity, getUserStats, type ScanWithType, type Redemption } from '@/lib/api';

type Activity = ScanWithType | Redemption;

export default function DashboardPage() {
  const { user } = useAuthenticator();
  const [activity, setActivity] = useState<Activity[]>([]);
  const [stats, setStats] = useState({
    totalCredits: 0,
    usedCredits: 0,
    availableCredits: 0
  });
  
  useEffect(() => {
    if (user?.userId) {
      loadUserData(user.userId);
    }
  }, [user]);

  async function loadUserData(userId: string) {
    try {
      const [userActivity, userStats] = await Promise.all([
        getUserActivity(userId),
        getUserStats(userId),
      ]);
      setActivity(userActivity);
      setStats(userStats);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }

  const statsDisplay = [
    { name: 'Kazanılan Puan', value: stats.totalCredits.toString(), icon: ArrowTrendingUpIcon },
    { name: 'Kullanılan Puan', value: stats.usedCredits.toString(), icon: GiftIcon },
    { name: 'Kalan Puan', value: stats.availableCredits.toString(), icon: CurrencyDollarIcon },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold leading-6 text-gray-900">Hoş geldiniz, {user?.signInDetails?.loginId}</h1>
          
          <p className="mt-2 text-sm text-gray-700">
            Geri dönüşüm aktivitelerinizi takip edin ve puanlarınızı kullanın.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2">
          <a href="/qrcode" className="flex items-center rounded-md bg-sky-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-sky-500">
            <QrCodeIcon className="h-4 w-4 mr-1.5" />
            QR Kodum
          </a>
          <a href="/marketplace" className="flex items-center rounded-md bg-green-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-green-500">
            <GiftIcon className="h-4 w-4 mr-1.5" />
            Bağış Yap
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {statsDisplay.map((stat) => (
          <div key={stat.name} className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">{stat.name}</dt>
                  <dd className="text-lg font-semibold tracking-tight text-gray-900">{stat.value}</dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Tüm Aktiviteler ({activity.length})</h2>
          <div className="mt-4 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">İşlem Türü</th>
                        <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Detay</th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Zaman</th>
                        <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Puan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {activity.map((item) => (
                        <tr key={item.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {item.type === 'scan' ? (
                              <div className="flex items-center">
                                <QrCodeIcon className="h-4 w-4 mr-1.5 text-green-600" />
                                <span>Geri Dönüşüm</span>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <GiftIcon className="h-4 w-4 mr-1.5 text-blue-600" />
                                <span>Bağış</span>
                              </div>
                            )}
                          </td>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {item.type === 'scan' 
                              ? `${item.binName || 'Bilinmeyen Kutu'} (${item.binLocation})`
                              : item.causeName || 'Bilinmeyen Kuruluş'
                            }
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {new Date(item.timestamp).toLocaleString('tr-TR')}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-right font-semibold">
                            {item.type === 'scan' ? (
                              <span className="text-green-600">+{item.credits}</span>
                            ) : (
                              <span className="text-blue-600">-{item.credits}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {activity.length === 0 && (
                    <div className="py-6 text-center text-gray-500">
                      <p>Henüz hiç aktivite yok.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 