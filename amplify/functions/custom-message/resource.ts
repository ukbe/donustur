import { defineFunction } from '@aws-amplify/backend';

export const customMessage = defineFunction({
  name: 'custom-message',
  // Instead of directly using the bucket name, set the environment variable to a lookup pattern
  // that AWS will resolve during deployment
  environment: {
    // This is a pseudo variable that will be replaced by Amplify Gen2 during deployment
    BUCKET_NAME: '#{Resources.Storage.donustur-templates.Name}'
  }
});
