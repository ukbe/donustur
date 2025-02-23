'use client';

import {Authenticator} from '@aws-amplify/ui-react';
import AuthHeader from '@/components/auth/AuthHeader';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        <Authenticator
          initialState="signUp"
          components={{
            Header() {
              return <AuthHeader title="Kayıt" subtitle="Hesap oluşturun" />;
            },
          }}
          services={{
            async validateCustomSignUp(formData) {
              if (!formData.email) {
                return {
                  email: ['Email adresi gerekli'],
                };
              }
              return undefined;
            },
          }}
        />
      </div>
    </div>
  );
}
