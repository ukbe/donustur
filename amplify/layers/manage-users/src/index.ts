import AWS from 'aws-sdk';
import { 
  addUserToGroup,
  removeUserFromGroup,
  updateUserAttributes,
  enableUser,
  disableUser,
  listUsers,
  getUser
} from './user-operations';
import { 
  formatUser,
  getUserAttributeValue,
  getUserGroups
} from './utils';
import * as types from './types';

// Re-export types
export * from './types';

// Create a singleton Cognito client to be reused
let cognitoISP: AWS.CognitoIdentityServiceProvider | null = null;

/**
 * Get or create the Cognito client
 */
export function getCognitoClient(): AWS.CognitoIdentityServiceProvider {
  if (!cognitoISP) {
    cognitoISP = new AWS.CognitoIdentityServiceProvider();
  }
  return cognitoISP;
}

/**
 * Initialize the module with configuration
 */
export function init(config?: AWS.CognitoIdentityServiceProvider.ClientConfiguration): void {
  cognitoISP = new AWS.CognitoIdentityServiceProvider(config);
}

/**
 * Helper to get user pool ID from environment
 */
export function getUserPoolId(): string {
  // Check for the environment variable that we set in the backend.ts file
  const userPoolId = process.env.AMPLIFY_AUTH_USERPOOL_ID;
                    
  if (!userPoolId) {
    // Log all environment variables to help debug
    console.log('Environment variables:', JSON.stringify(process.env));
    throw new Error('AMPLIFY_AUTH_USERPOOL_ID environment variable is not set');
  }
  return userPoolId;
}

// User operations
export {
  addUserToGroup,
  removeUserFromGroup,
  updateUserAttributes,
  enableUser,
  disableUser,
  listUsers,
  getUser
};

// Utils
export {
  formatUser,
  getUserAttributeValue,
  getUserGroups
};

// Export the helper types explicitly
export const userManagementTypes = types; 