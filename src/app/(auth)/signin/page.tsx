'use client';

import {Authenticator, useAuthenticator} from '@aws-amplify/ui-react';
import {useEffect} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import AuthHeader from '@/components/auth/AuthHeader';
import {Suspense} from 'react';

function SignInContent() {
  const {authStatus} = useAuthenticator();
  const router = useRouter();
  const searchParams = useSearchParams();
  const binId = searchParams.get('bin');

  useEffect(() => {
    if (authStatus === 'authenticated') {
      // Check if coming from a scan
      if (binId) {
        router.replace(`/scan?bin=${binId}`);
      } else {
        router.replace('/dashboard');
      }
    }
  }, [authStatus, router, binId]);

  return (
    <div className="w-full max-w-md">
      <Authenticator
        initialState="signIn"
        components={{
          Header() {
            return <AuthHeader title="Giriş Yap" subtitle="Hesabınıza giriş yapın" />;
          },
        }}
      />
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Suspense fallback={<div className="text-center">Yükleniyor...</div>}>
        <SignInContent />
      </Suspense>
    </div>
  );
}
