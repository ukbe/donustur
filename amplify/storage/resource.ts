import { defineStorage } from '@aws-amplify/backend';
import { customMessage } from '../functions/custom-message/resource';

export const defaultBucket = defineStorage({
  name: 'donustur-templates',
  access: (allow) => ({
    'auth/*': [allow.resource(customMessage).to(['read'])]
  })
});
