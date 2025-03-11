'use client';

import {useAuthenticator} from '@aws-amplify/ui-react';
import {useRouter} from 'next/navigation';
import {useEffect} from 'react';
import Header from '@/components/common/Header';

export default function ProtectedLayout({children}: {children: React.ReactNode}) {
  const {authStatus} = useAuthenticator();
  const router = useRouter();

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.replace('/signin');
    }
  }, [authStatus, router]);

  if (authStatus !== 'authenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />
      <main>{children}</main>
    </div>
  );
}
