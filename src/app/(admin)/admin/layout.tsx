'use client';

import {useAuthenticator} from '@aws-amplify/ui-react';
import {useRouter, usePathname} from 'next/navigation';
import {useEffect} from 'react';
import {HomeIcon, QrCodeIcon, UserGroupIcon, ChartBarIcon} from '@heroicons/react/24/outline';
import Logo from '@/components/common/Logo';
import {fetchAuthSession} from 'aws-amplify/auth';
import {NotificationProvider} from '@/components/ui/NotificationContext';

const navigation = [
  {name: 'Dashboard', href: '/admin', icon: HomeIcon},
  {name: 'Geri Dönüşüm Kutuları', href: '/admin/bins', icon: QrCodeIcon},
  {name: 'Kullanıcılar', href: '/admin/users', icon: UserGroupIcon},
  {name: 'Raporlar', href: '/admin/reports', icon: ChartBarIcon},
];

export default function AdminLayout({children}: {children: React.ReactNode}) {
  const {signOut} = useAuthenticator();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function checkAdmin() {
      const session = await fetchAuthSession();
      const groups = (session.tokens?.accessToken.payload['cognito:groups'] as string[]) || [];
      if (!groups.includes('admin')) {
        router.replace('/');
      }
    }
    checkAdmin();
  }, [router]);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  return (
    <NotificationProvider>
      <div>
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
            <div className="flex h-16 shrink-0 items-center">
              <Logo className="h-8" width={120} height={40} />
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <a
                          href={item.href}
                          className={`
                            group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold
                            ${pathname === item.href ? 'bg-gray-50 text-green-600' : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'}
                          `}
                        >
                          <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
                <li className="mt-auto">
                  <button
                    onClick={handleSignOut}
                    className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-50 hover:text-green-600"
                  >
                    Çıkış Yap
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <main className="lg:pl-72">
          <div className="px-4 sm:px-6 lg:px-8 py-6">{children}</div>
        </main>
      </div>
    </NotificationProvider>
  );
}
