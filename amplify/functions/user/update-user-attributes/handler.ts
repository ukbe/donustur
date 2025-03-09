import { 
  updateUserAttributes as updateUserAttributesOperation, 
  getUserPoolId, 
  getCognitoClient,
  formatUser,
  FormattedUser
} from '@manage-users';

// Define event and response types
interface AppSyncEvent {
  arguments: {
    id: string;
    attributes: Record<string, string | number | boolean>;
  };
}

interface Response {
  success: boolean;
  message: string;
  user?: FormattedUser;
}

/**
 * Update user attributes
 * @param event - The event containing userId and attributes to update
 * @returns Response with success status and message
 */
export const handler = async (event: AppSyncEvent): Promise<Response> => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  try {
    // Extract arguments from event
    const { arguments: args = { id: '', attributes: {} } } = event;
    const { id, attributes } = args;
    
    if (!id) {
      return {
        success: false,
        message: 'User ID is required'
      };
    }
    
    if (!attributes || Object.keys(attributes).length === 0) {
      return {
        success: false,
        message: 'At least one attribute must be provided for update'
      };
    }
    
    const userPoolId = getUserPoolId();
    const cognitoClient = getCognitoClient();
    
    const result = await updateUserAttributesOperation({
      userPoolId,
      username: id,
      userAttributes: attributes
    }, cognitoClient);
    
    console.log('Operation result:', JSON.stringify(result, null, 2));
    
    // Format the user for client response
    const formattedUser = result.user ? formatUser(result.user) : undefined;
    
    return {
      success: result.success,
      message: result.message || '',
      user: formattedUser
    };
  } catch (error) {
    console.error('Error in updateUserAttributes Lambda:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}; 