import { defineFunction } from '@aws-amplify/backend';

export const customMessage = defineFunction({
  name: 'custom-message',
  // Remove the manual environment variable since we'll use the auto-generated one
  // Amplify automatically provides DONUSTUR_TEMPLATES_BUCKET_NAME through SSM
});
