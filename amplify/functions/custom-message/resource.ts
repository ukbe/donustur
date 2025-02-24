import { defineFunction } from '@aws-amplify/backend';
import { env } from '$amplify/env/custom-message';

export const customMessage = defineFunction({
  name: "custom-message",
  resourceGroupName: 'auth',
  environment: {
    OBJECT_PATH: "auth/",
    TEMPLATE_BUCKET_NAME: env.DONUSTUR_TEMPLATES_BUCKET_NAME
  }
});
