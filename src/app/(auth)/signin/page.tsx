'use client';

import {Authenticator} from '@aws-amplify/ui-react';
import AuthHeader from '@/components/auth/AuthHeader';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
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
