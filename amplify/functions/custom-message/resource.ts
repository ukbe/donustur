import { defineFunction } from '@aws-amplify/backend';

export const customMessage = defineFunction({
  name: "custom-message",
  resourceGroupName: 'auth',
  environment: {
    OBJECT_PATH: "auth/",
    TEMPLATE_BUCKET_NAME: 'donustur-templates'
  }
});
