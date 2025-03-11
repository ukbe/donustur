'use client';

import {useEffect, useState} from 'react';
import {UsersIcon, QrCodeIcon, CurrencyDollarIcon, ShoppingBagIcon} from '@heroicons/react/24/outline';
import {getAdminStats} from '@/lib/api';
import {fetchAuthSession} from 'aws-amplify/auth';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalBins: 0,
    activeBins: 0,
    totalUsers: 0,
    totalScans: 0,
    totalCredits: 0,
    totalRedemptions: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      try {
        console.log('Checking auth session...');
        const auth = await fetchAuthSession();
        console.log('Auth session retrieved:', auth);

        // Check if user is in admin group
        const groups = (auth.tokens?.accessToken.payload['cognito:groups'] as string[]) || [];
        console.log('User groups:', groups);

        if (!groups.includes('admin')) {
          console.error('User is not an admin');
          window.location.href = '/';
        } else {
          // Load admin stats after authentication is confirmed
          loadAdminStats();
        }
      } catch (error) {
        console.error('Authentication error:', error);

        // Check if it's an error with fetchAuthSession function not found
        if (error instanceof TypeError && (error.message.includes('is not a function') || error.message.includes('fetchAuthSession'))) {
          console.error('fetchAuthSession function not found - this could be due to AWS Amplify not being properly initialized');
          // Try to import from the Amplify global object
          try {
            // Direct import of fetchAuthSession
            const {fetchAuthSession: directFetchAuth} = await import('aws-amplify/auth');

            console.log('Re-imported fetchAuthSession function');
            if (typeof directFetchAuth === 'function') {
              console.log('Using directly imported fetchAuthSession');
              const auth = await directFetchAuth();
              console.log('Auth session obtained:', auth);

              // Check if user is admin after re-import
              const groups = (auth.tokens?.accessToken.payload['cognito:groups'] as string[]) || [];
              if (groups.includes('admin')) {
                loadAdminStats();
              } else {
                window.location.href = '/';
              }
            } else {
              console.error('Re-imported fetchAuthSession is not a function');
              window.location.href = '/';
            }
          } catch (importError) {
            console.error('Error importing Amplify modules:', importError);
            window.location.href = '/';
          }
        } else {
          // Redirect on any auth error
          window.location.href = '/';
        }
      }
    };

    checkAuth();
  }, []);

  const loadAdminStats = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Loading admin statistics...');
      const adminStats = await getAdminStats();

      setStats(adminStats);
      console.log('Admin statistics loaded:', adminStats);
    } catch (error) {
      console.error('Error loading admin statistics:', error);
      setError('Failed to load dashboard statistics. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

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
      value: stats.totalRedemptions,
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
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          {error && <span className="px-4 py-2 text-sm text-red-500">{error}</span>}
          <button
            type="button"
            onClick={loadAdminStats}
            disabled={loading}
            className="block rounded-md bg-green-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:opacity-50"
          >
            {loading ? 'Yükleniyor...' : 'Yenile'}
          </button>
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
