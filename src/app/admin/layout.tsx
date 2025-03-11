'use client';

import {useAuthenticator} from '@aws-amplify/ui-react';
import {useRouter, usePathname} from 'next/navigation';
import {useEffect, useState} from 'react';
import {HomeIcon, QrCodeIcon, UserGroupIcon, HeartIcon, ArrowLeftIcon, Bars3Icon, XMarkIcon} from '@heroicons/react/24/outline';
import Logo from '@/components/common/Logo';
import {fetchAuthSession} from 'aws-amplify/auth';
import {NotificationProvider} from '@/components/ui/NotificationContext';

const navigation = [
  {name: 'Dashboard', href: '/admin', icon: HomeIcon},
  {name: 'Geri Dönüşüm Kutuları', href: '/admin/bins', icon: QrCodeIcon},
  {name: 'Kullanıcılar', href: '/admin/users', icon: UserGroupIcon},
  {name: 'Amaçlar', href: '/admin/causes', icon: HeartIcon},
];

export default function AdminLayout({children}: {children: React.ReactNode}) {
  const {signOut} = useAuthenticator();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6">
          <button type="button" className="-m-2.5 p-2.5 text-gray-700 lg:hidden" onClick={() => setMobileMenuOpen(true)}>
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>

          <div className="flex flex-1 items-center justify-between">
            <Logo className="h-10" width={120} height={40} />
            <div className="flex items-center gap-x-4">
              <a href="/dashboard" className="rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors duration-200">
                Kullanıcı Paneli
              </a>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`relative z-50 lg:hidden ${mobileMenuOpen ? '' : 'hidden'}`}>
          <div className="fixed inset-0 bg-gray-900/80" onClick={() => setMobileMenuOpen(false)}></div>

          <div className="fixed inset-0 flex">
            <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white pb-4">
              <div className="flex items-center justify-between px-4 pt-5 pb-2">
                <Logo className="h-8" width={120} height={40} />
                <button type="button" className="-m-2.5 rounded-md p-2.5 text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                  <span className="sr-only">Close sidebar</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              {/* Mobile Navigation Links */}
              <div className="mt-2 overflow-y-auto px-4">
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
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                              {item.name}
                            </a>
                          </li>
                        ))}
                        <li className="pt-6">
                          <a
                            href="/dashboard"
                            className="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-50 hover:text-green-600"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <ArrowLeftIcon className="h-6 w-6 shrink-0" aria-hidden="true" />
                            Kullanıcı Paneline Dön
                          </a>
                        </li>
                      </ul>
                    </li>
                    <li className="mt-auto">
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          handleSignOut();
                        }}
                        className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-50 hover:text-green-600 w-full"
                      >
                        Çıkış Yap
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop sidebar */}
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
                    <li className="pt-10">
                      <a href="/dashboard" className="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-50 hover:text-green-600">
                        <ArrowLeftIcon className="h-6 w-6 shrink-0" aria-hidden="true" />
                        Kullanıcı Paneline Dön
                      </a>
                    </li>
                  </ul>
                </li>
                <li className="mt-auto">
                  <button
                    onClick={handleSignOut}
                    className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-50 hover:text-green-600 w-full"
                  >
                    Çıkış Yap
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <main className="lg:pl-72">
          {/* Empty toolbar for spacing */}
          <div className="h-4 bg-gray-50"></div>

          <div className="px-4 sm:px-6 lg:px-8 py-6">{children}</div>
        </main>
      </div>
    </NotificationProvider>
  );
}
