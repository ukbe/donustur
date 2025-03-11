import AWS from 'aws-sdk';
import { 
  AddUserToGroupParams,
  RemoveUserFromGroupParams,
  UpdateUserAttributesParams,
  EnableDisableUserParams,
  ListUsersParams,
  GetUserParams,
  UserManagementResponse,
} from './types';
import { 
  validateBaseParams, 
  createErrorResponse, 
  createSuccessResponse, 
  getUserGroups,
  adaptCognitoUserToUser
} from './utils';

/**
 * Add a user to a group
 */
export async function addUserToGroup(
  params: AddUserToGroupParams,
  cognitoISP?: AWS.CognitoIdentityServiceProvider
): Promise<UserManagementResponse> {
  try {
    const validationError = validateBaseParams(params);
    if (validationError) return createErrorResponse(validationError);
    
    if (!params.groupName) return createErrorResponse('Group name is required');

    const cognito = cognitoISP || new AWS.CognitoIdentityServiceProvider();
    
    await cognito.adminAddUserToGroup({
      UserPoolId: params.userPoolId,
      Username: params.username,
      GroupName: params.groupName
    }).promise();
    
    // Get updated user with groups
    const userResponse = await cognito.adminGetUser({
      UserPoolId: params.userPoolId,
      Username: params.username
    }).promise();
    
    const groups = await getUserGroups(cognito, params.userPoolId, params.username);
    const user = adaptCognitoUserToUser(userResponse, groups);
    
    return createSuccessResponse({ 
      message: `User ${params.username} added to group ${params.groupName}`,
      user: user
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return createErrorResponse(`Failed to add user to group: ${errorMessage}`);
  }
}

/**
 * Remove a user from a group
 */
export async function removeUserFromGroup(
  params: RemoveUserFromGroupParams,
  cognitoISP?: AWS.CognitoIdentityServiceProvider
): Promise<UserManagementResponse> {
  try {
    const validationError = validateBaseParams(params);
    if (validationError) return createErrorResponse(validationError);
    
    if (!params.groupName) return createErrorResponse('Group name is required');

    const cognito = cognitoISP || new AWS.CognitoIdentityServiceProvider();
    
    await cognito.adminRemoveUserFromGroup({
      UserPoolId: params.userPoolId,
      Username: params.username,
      GroupName: params.groupName
    }).promise();
    
    // Get updated user with groups
    const userResponse = await cognito.adminGetUser({
      UserPoolId: params.userPoolId,
      Username: params.username
    }).promise();
    
    const groups = await getUserGroups(cognito, params.userPoolId, params.username);
    const user = adaptCognitoUserToUser(userResponse, groups);
    
    return createSuccessResponse({ 
      message: `User ${params.username} removed from group ${params.groupName}`,
      user: user
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return createErrorResponse(`Failed to remove user from group: ${errorMessage}`);
  }
}

/**
 * Update user attributes
 */
export async function updateUserAttributes(
  params: UpdateUserAttributesParams,
  cognitoISP?: AWS.CognitoIdentityServiceProvider
): Promise<UserManagementResponse> {
  try {
    const validationError = validateBaseParams(params);
    if (validationError) return createErrorResponse(validationError);
    
    if (!params.userAttributes || Object.keys(params.userAttributes).length === 0) {
      return createErrorResponse('At least one attribute must be provided');
    }

    const cognito = cognitoISP || new AWS.CognitoIdentityServiceProvider();
    
    // Convert attributes to Cognito format
    const userAttributes: AWS.CognitoIdentityServiceProvider.AttributeListType = [];
    
    if (params.userAttributes.name !== undefined) {
      userAttributes.push({ Name: 'name', Value: String(params.userAttributes.name) });
    }
    
    if (params.userAttributes.email !== undefined) {
      userAttributes.push({ Name: 'email', Value: String(params.userAttributes.email) });
      userAttributes.push({ Name: 'email_verified', Value: 'true' });
    }
    
    if (params.userAttributes.credits !== undefined) {
      userAttributes.push({ 
        Name: 'custom:credits', 
        Value: params.userAttributes.credits !== null ? String(params.userAttributes.credits) : '0'
      });
    }
    
    // Add any other custom attributes
    Object.entries(params.userAttributes).forEach(([key, value]) => {
      if (!['name', 'email', 'credits'].includes(key) && value !== undefined) {
        const attributeName = key.startsWith('custom:') ? key : `custom:${key}`;
        userAttributes.push({ 
          Name: attributeName, 
          Value: value !== null ? String(value) : '' 
        });
      }
    });
    
    // Only proceed if there are attributes to update
    if (userAttributes.length === 0) {
      return createErrorResponse('No valid attributes provided for update');
    }
    
    await cognito.adminUpdateUserAttributes({
      UserPoolId: params.userPoolId,
      Username: params.username,
      UserAttributes: userAttributes
    }).promise();
    
    // Get updated user
    const userResponse = await cognito.adminGetUser({
      UserPoolId: params.userPoolId,
      Username: params.username
    }).promise();
    
    const groups = await getUserGroups(cognito, params.userPoolId, params.username);
    const user = adaptCognitoUserToUser(userResponse, groups);
    
    return createSuccessResponse({ 
      message: `User ${params.username} attributes updated successfully`,
      user: user
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return createErrorResponse(`Failed to update user attributes: ${errorMessage}`);
  }
}

/**
 * Enable a user
 */
export async function enableUser(
  params: EnableDisableUserParams,
  cognitoISP?: AWS.CognitoIdentityServiceProvider
): Promise<UserManagementResponse> {
  try {
    const validationError = validateBaseParams(params);
    if (validationError) return createErrorResponse(validationError);

    const cognito = cognitoISP || new AWS.CognitoIdentityServiceProvider();
    
    await cognito.adminEnableUser({
      UserPoolId: params.userPoolId,
      Username: params.username
    }).promise();
    
    // Get updated user
    const userResponse = await cognito.adminGetUser({
      UserPoolId: params.userPoolId,
      Username: params.username
    }).promise();
    
    const groups = await getUserGroups(cognito, params.userPoolId, params.username);
    const user = adaptCognitoUserToUser(userResponse, groups);
    
    return createSuccessResponse({ 
      message: `User ${params.username} enabled successfully`,
      user: user
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return createErrorResponse(`Failed to enable user: ${errorMessage}`);
  }
}

/**
 * Disable a user
 */
export async function disableUser(
  params: EnableDisableUserParams,
  cognitoISP?: AWS.CognitoIdentityServiceProvider
): Promise<UserManagementResponse> {
  try {
    const validationError = validateBaseParams(params);
    if (validationError) return createErrorResponse(validationError);

    const cognito = cognitoISP || new AWS.CognitoIdentityServiceProvider();
    
    await cognito.adminDisableUser({
      UserPoolId: params.userPoolId,
      Username: params.username
    }).promise();
    
    // Get updated user
    const userResponse = await cognito.adminGetUser({
      UserPoolId: params.userPoolId,
      Username: params.username
    }).promise();
    
    const groups = await getUserGroups(cognito, params.userPoolId, params.username);
    const user = adaptCognitoUserToUser(userResponse, groups);
    
    return createSuccessResponse({ 
      message: `User ${params.username} disabled successfully`,
      user: user
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return createErrorResponse(`Failed to disable user: ${errorMessage}`);
  }
}

/**
 * List users in the user pool
 */
export async function listUsers(
  params: ListUsersParams,
  cognitoISP?: AWS.CognitoIdentityServiceProvider
): Promise<UserManagementResponse> {
  try {
    if (!params.userPoolId) return createErrorResponse('User pool ID is required');

    const cognito = cognitoISP || new AWS.CognitoIdentityServiceProvider();
    
    const listParams: AWS.CognitoIdentityServiceProvider.ListUsersRequest = {
      UserPoolId: params.userPoolId,
      Limit: params.limit || 60
    };
    
    if (params.filter) {
      listParams.Filter = params.filter;
    }
    
    const response = await cognito.listUsers(listParams).promise();
    
    // Get groups for each user
    const usersWithGroups = await Promise.all(
      (response.Users || []).map(async (user: AWS.CognitoIdentityServiceProvider.UserType) => {
        const groups = await getUserGroups(cognito, params.userPoolId, user.Username || '');
        return adaptCognitoUserToUser(user, groups);
      })
    );
    
    return createSuccessResponse({ 
      message: `Retrieved ${usersWithGroups.length} users`,
      users: usersWithGroups
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return createErrorResponse(`Failed to list users: ${errorMessage}`);
  }
}

/**
 * Get a user by username
 */
export async function getUser(
  params: GetUserParams,
  cognitoISP?: AWS.CognitoIdentityServiceProvider
): Promise<UserManagementResponse> {
  try {
    const validationError = validateBaseParams(params);
    if (validationError) return createErrorResponse(validationError);

    const cognito = cognitoISP || new AWS.CognitoIdentityServiceProvider();
    
    const userResponse = await cognito.adminGetUser({
      UserPoolId: params.userPoolId,
      Username: params.username
    }).promise();
    
    const groups = await getUserGroups(cognito, params.userPoolId, params.username);
    const user = adaptCognitoUserToUser(userResponse, groups);
    
    return createSuccessResponse({ 
      message: `User ${params.username} retrieved successfully`,
      user: user
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return createErrorResponse(`Failed to get user: ${errorMessage}`);
  }
} 