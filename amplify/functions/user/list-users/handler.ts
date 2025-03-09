import { 
  listUsers as listUsersOperation, 
  getUserPoolId, 
  getCognitoClient,
  formatUser,
  FormattedUser,
  User
} from '@manage-users';

// Define event and response types
interface AppSyncEvent {
  arguments?: {
    filter?: string;
    limit?: number;
    paginationToken?: string;
  };
}

interface Response {
  success: boolean;
  message: string;
  users: FormattedUser[];
}

/**
 * List users in the user pool
 * @param event - The event containing optional filter, limit, and pagination token
 * @returns Response with success status, message, and list of users
 */
export const handler = async (event: AppSyncEvent): Promise<Response> => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  try {
    // Extract arguments from event
    const { arguments: args = {} } = event;
    const { filter, limit, paginationToken } = args || {};
    
    const userPoolId = getUserPoolId();
    const cognitoClient = getCognitoClient();
    
    const result = await listUsersOperation({
      userPoolId,
      filter,
      limit,
      paginationToken
    }, cognitoClient);
    
    console.log('Operation result users count:', result.users?.length || 0);
    
    // Format the users for client response
    const formattedUsers = result.users 
      ? result.users.map((user: User) => formatUser(user))
      : [];
    
    return {
      success: result.success,
      message: result.message || '',
      users: formattedUsers
    };
  } catch (error) {
    console.error('Error in listUsers Lambda:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      users: []
    };
  }
}; 