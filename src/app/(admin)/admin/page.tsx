'use client';

import {useEffect, useState} from 'react';
import {UsersIcon, QrCodeIcon, CurrencyDollarIcon, ShoppingBagIcon} from '@heroicons/react/24/outline';
import {listBins} from '@/lib/api';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalBins: 0,
    activeBins: 0,
    totalUsers: 0,
    totalScans: 0,
    totalCredits: 0,
    totalRewards: 0,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const bins = await listBins();
        setStats((prev) => ({
          ...prev,
          totalBins: bins.length,
          activeBins: bins.filter((bin) => bin.status === 'active').length,
        }));
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    }
    loadStats();
  }, []);

  const statCards = [
    {
      name: 'Toplam Kullanıcı',
      value: stats.totalUsers,
      icon: UsersIcon,
      description: 'Kayıtlı kullanıcı sayısı',
    },
    {
      name: 'Aktif Kutular',
      value: `${stats.activeBins}/${stats.totalBins}`,
      icon: QrCodeIcon,
      description: 'Aktif/Toplam kutu sayısı',
    },
    {
      name: 'Toplam İşlem',
      value: stats.totalScans,
      icon: CurrencyDollarIcon,
      description: 'Gerçekleşen geri dönüşüm işlemi',
    },
    {
      name: 'Verilen Ödül',
      value: stats.totalRewards,
      icon: ShoppingBagIcon,
      description: 'Kullanılan ödül sayısı',
    },
  ];

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Yönetici Paneli</h1>
          <p className="mt-2 text-sm text-gray-700">Sistem genelindeki istatistikleri görüntüleyin.</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.name} className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6">
            <dt>
              <div className="absolute rounded-md bg-green-500 p-3">
                <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">{stat.name}</p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              <div className="absolute inset-x-0 bottom-0 bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <span className="text-gray-500">{stat.description}</span>
                </div>
              </div>
            </dd>
          </div>
        ))}
      </div>

      {/* We can add charts or detailed stats tables here later */}
    </div>
  );
}
