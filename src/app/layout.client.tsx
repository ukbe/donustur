'use client';

import {Amplify} from 'aws-amplify';
import {Authenticator} from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import outputs from '../../amplify_outputs.json';
import '../lib/i18n'; // Import translations
import {NotificationProvider} from '@/components/ui/NotificationContext';

// Configure Amplify once at the root
Amplify.configure(outputs, {ssr: true});

export default function RootLayoutClient({children}: {children: React.ReactNode}) {
  return (
    <Authenticator.Provider>
      <NotificationProvider>
        <div lang="tr">{children}</div>
      </NotificationProvider>
    </Authenticator.Provider>
  );
}
