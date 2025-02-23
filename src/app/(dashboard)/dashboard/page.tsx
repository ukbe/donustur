'use client';

import {useAuthenticator} from '@aws-amplify/ui-react';
import {QrCodeIcon, ArrowTrendingUpIcon, GiftIcon} from '@heroicons/react/24/outline';
import Logo from '@/components/common/Logo';

const stats = [
  {name: 'Toplam Puan', value: '2,450', icon: ArrowTrendingUpIcon},
  {name: 'Toplam İşlem', value: '12', icon: QrCodeIcon},
  {name: 'Kullanılan Puan', value: '500', icon: GiftIcon},
];

const recentScans = [
  {
    id: 1,
    location: 'Kadıköy Geri Dönüşüm',
    timestamp: '2 saat önce',
    points: '+50',
  },
  {
    id: 2,
    location: 'Üsküdar Geri Dönüşüm',
    timestamp: '3 gün önce',
    points: '+50',
  },
  // Add more dummy data as needed
];

export default function DashboardPage() {
  const {user, signOut} = useAuthenticator();

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Navigation Header */}
      <div className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 justify-between items-center">
            <Logo className="h-8" width={120} height={40} />
            <button onClick={signOut} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
              Çıkış Yap
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold leading-6 text-gray-900">Hoş geldiniz, {user?.signInDetails?.loginId}</h1>
            <p className="mt-2 text-sm text-gray-700">Geri dönüşüm aktivitelerinizi takip edin ve puanlarınızı kullanın.</p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <a href="/marketplace" className="block rounded-md bg-green-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-green-500">
              Ödülleri Görüntüle
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {stats.map((stat) => (
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
                        {recentScans.map((scan) => (
                          <tr key={scan.id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{scan.location}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{scan.timestamp}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-green-600 font-semibold">{scan.points}</td>
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
    </div>
  );
}
