'use client';

import {withAuthenticator, useAuthenticator, Authenticator} from '@aws-amplify/ui-react';
import {useEffect} from 'react';
import {useRouter} from 'next/navigation';
import AuthHeader from '@/components/auth/AuthHeader';

function SignInPage() {
  const {authStatus} = useAuthenticator();
  const router = useRouter();

  useEffect(() => {
    if (authStatus === 'authenticated') {
      router.replace('/dashboard');
    }
  }, [authStatus, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md">
        <Authenticator
          initialState="signIn"
          components={{
            Header() {
              return <AuthHeader title="Giriş" subtitle="Hesabınıza giriş yapın" />;
            },
          }}
        />
      </div>
    </div>
  );
}

export default withAuthenticator(SignInPage, {
  initialState: 'signIn',
  components: {
    Header() {
      return <AuthHeader title="Giriş" subtitle="Hesabınıza giriş yapın" />;
    },
  },
});
