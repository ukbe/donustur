import { 
  addUserToGroup as addUserToGroupOperation, 
  getUserPoolId, 
  getCognitoClient,
  formatUser,
  FormattedUser
} from '@manage-users';

// Define event and response types
interface AppSyncEvent {
  arguments: {
    userId: string;
    groupName: string;
  };
}

interface Response {
  success: boolean;
  message: string;
  user?: FormattedUser;
}

/**
 * Add a user to a group
 * @param event - The event containing userId and groupName
 * @returns Response with success status and message
 */
export const handler = async (event: AppSyncEvent): Promise<Response> => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  try {
    // Extract arguments from event
    const { arguments: args = { userId: '', groupName: '' } } = event;
    const { userId, groupName } = args;
    
    if (!userId) {
      return {
        success: false,
        message: 'User ID is required'
      };
    }
    
    if (!groupName) {
      return {
        success: false,
        message: 'Group name is required'
      };
    }
    
    const userPoolId = getUserPoolId();
    const cognitoClient = getCognitoClient();
    
    const result = await addUserToGroupOperation({
      userPoolId,
      username: userId,
      groupName
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
    console.error('Error in addUserToGroup Lambda:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}; 