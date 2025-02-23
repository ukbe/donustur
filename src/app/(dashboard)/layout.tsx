'use client';

import {useAuthenticator} from '@aws-amplify/ui-react';
import {useRouter} from 'next/navigation';
import {useEffect} from 'react';

export default function DashboardLayout({children}: {children: React.ReactNode}) {
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

  return <>{children}</>;
}
