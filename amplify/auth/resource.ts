import { defineAuth } from '@aws-amplify/backend';
import { customMessage } from '../functions/custom-message/resource';
import { postConfirmation } from '../functions/post-confirmation/resource';
/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  senders: {
    email: {
      fromEmail: "noreply@donustur.online",
      fromName: 'Dönüştür'
    },
  },
  triggers: {
    customMessage: customMessage,
    postConfirmation: postConfirmation
  },
loginWith: {
    email: true
  },
  userAttributes: {
    email: {
      required: true,
      mutable: true,
    },
  },
  // Add admin group
  groups: ['admin'],
  // Enable MFA if needed
  multifactor: {
    mode: 'OFF',
  },
});
