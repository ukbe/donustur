'use client';

import {useAuthenticator} from '@aws-amplify/ui-react';
import {useRouter, usePathname} from 'next/navigation';
import Logo from '@/components/common/Logo';
import Link from 'next/link';
import {useEffect, useState} from 'react';
import {fetchAuthSession} from 'aws-amplify/auth';

export default function Header() {
  const {signOut} = useAuthenticator();
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      const session = await fetchAuthSession();
      const groups = (session.tokens?.accessToken.payload['cognito:groups'] as string[]) || [];
      setIsAdmin(groups.includes('admin'));
    }
    checkAdmin();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  const isActive = (path: string) => {
    return pathname === path ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700';
  };

  return (
    <div className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Desktop layout */}
        <div className="hidden md:flex md:h-16 md:items-center">
          {/* Left column - Logo */}
          <div className="flex-shrink-0 w-1/3 flex justify-start">
            <Logo className="h-15" width={125} />
          </div>

          {/* Center column - Main navigation */}
          <div className="w-1/3 flex justify-center space-x-6">
            <Link href="/dashboard" className={`inline-flex items-center px-2 pt-1 text-sm font-medium ${isActive('/dashboard')}`}>
              Ana Sayfa
            </Link>
            <Link href="/marketplace" className={`inline-flex items-center px-2 pt-1 text-sm font-medium ${isActive('/marketplace')}`}>
              Bağış Yap
            </Link>
          </div>

          {/* Right column - Admin button and logout */}
          <div className="flex-shrink-0 w-1/3 flex justify-end items-center space-x-4">
            {isAdmin && (
              <Link href="/admin" className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors duration-200">
                Yönetici Paneli
              </Link>
            )}
            <button
              onClick={handleSignOut}
              className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Çıkış Yap
            </button>
          </div>
        </div>

        {/* Mobile layout */}
        <div className="md:hidden flex flex-col">
          {/* Top row with logo and logout button */}
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <Logo className="h-12" width={100} />
            </div>
            <div className="flex items-center space-x-2">
              {isAdmin && (
                <Link href="/admin" className="rounded-md bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors duration-200">
                  Yönetici
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Çıkış
              </button>
            </div>
          </div>

          {/* Bottom row with navigation links */}
          <div className="flex justify-center space-x-8 pb-2">
            <Link href="/dashboard" className={`inline-flex items-center px-2 text-sm font-medium ${isActive('/dashboard')}`}>
              Ana Sayfa
            </Link>
            <Link href="/marketplace" className={`inline-flex items-center px-2 text-sm font-medium ${isActive('/marketplace')}`}>
              Bağış Yap
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
