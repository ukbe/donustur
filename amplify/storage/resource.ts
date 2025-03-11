import { defineStorage } from '@aws-amplify/backend';
import { customMessage } from '../functions/custom-message/resource';

export const defaultBucket = defineStorage({
  name: 'donustur-templates',
  access: (allow) => ({
    'email-templates/*': [allow.resource(customMessage).to(['read'])],
    'uploads/*': [
      allow.authenticated.to(['read']),
      allow.groups(['admin']).to(['read', 'write']),
      allow.guest.to(['read']),
    ],
  }),
});
