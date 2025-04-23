'use client';

import { useAuthenticator } from '@aws-amplify/ui-react';
import { QrCodeIcon, ArrowTrendingUpIcon, GiftIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { getUserScans, getUserStats, type Scan } from '@/lib/api';
import { fetchAuthSession } from 'aws-amplify/auth';

export default function DashboardPage() {
  const { user } = useAuthenticator();
  const [scans, setScans] = useState<Scan[]>([]);
  const [stats, setStats] = useState({
    totalCredits: 0,
    totalScans: 0,
    usedCredits: 0,
    availableCredits: 0
  });
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user?.userId) {
      loadUserData(user.userId);
    }
  }, [user]);

  useEffect(() => {
    async function checkAdmin() {
      const session = await fetchAuthSession();
      const groups = (session.tokens?.accessToken.payload['cognito:groups'] as string[]) || [];
      setIsAdmin(groups.includes('admin'));
    }
    checkAdmin();
  }, []);

  async function loadUserData(userId: string) {
    try {
      const [userScans, userStats] = await Promise.all([
        getUserScans(userId),
        getUserStats(userId),
      ]);
      setScans(userScans);
      setStats(userStats);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }

  const statsDisplay = [
    { name: 'Toplam Puan', value: stats.totalCredits.toString(), icon: ArrowTrendingUpIcon },
    { name: 'Toplam İşlem', value: stats.totalScans.toString(), icon: QrCodeIcon },
    { name: 'Kullanılan Puan', value: stats.usedCredits.toString(), icon: GiftIcon },
    { name: 'Kullanılabilir Puan', value: stats.availableCredits.toString(), icon: CurrencyDollarIcon },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold leading-6 text-gray-900">Hoş geldiniz, {user?.signInDetails?.loginId}</h1>
          
          <p className="mt-2 text-sm text-gray-700">
            Geri dönüşüm aktivitelerinizi takip edin ve puanlarınızı kullanın.
            {isAdmin && (
              <>
                {' • '}
                <a href="/admin" className="text-green-600 hover:text-green-500">
                  Yönetici Paneli
                </a>
              </>
            )}
          </p>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2">
          <a href="/qrcode" className="flex items-center rounded-md bg-sky-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-sky-500">
            <QrCodeIcon className="h-4 w-4 mr-1.5" />
            QR Kodum
          </a>
          <a href="/marketplace" className="flex items-center rounded-md bg-green-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-green-500">
            Ödülleri Görüntüle
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
          <h2 className="text-base font-semibold leading-7 text-gray-900">Son İşlemler</h2>
          <div className="mt-4 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Konum</th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Zaman</th>
                        <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Puan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {scans.map((scan) => (
                        <tr key={scan.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {scan.binLocation}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {new Date(scan.timestamp).toLocaleString('tr-TR')}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-green-600 font-semibold">
                            +{scan.credits}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 