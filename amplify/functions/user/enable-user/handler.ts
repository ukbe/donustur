import { 
  enableUser as enableUserOperation, 
  getUserPoolId, 
  getCognitoClient,
  formatUser,
  FormattedUser
} from '@manage-users';

// Define event and response types
interface AppSyncEvent {
  arguments: {
    id: string;
  };
}

interface Response {
  success: boolean;
  message: string;
  user?: FormattedUser;
}

/**
 * Enable a user
 * @param event - The event containing userId
 * @returns Response with success status and message
 */
export const handler = async (event: AppSyncEvent): Promise<Response> => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  try {
    // Extract arguments from event
    const { arguments: args = { id: '' } } = event;
    const { id } = args;
    
    if (!id) {
      return {
        success: false,
        message: 'User ID is required'
      };
    }
    
    const userPoolId = getUserPoolId();
    const cognitoClient = getCognitoClient();
    
    const result = await enableUserOperation({
      userPoolId,
      username: id
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
    console.error('Error in enableUser Lambda:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}; 