import AWS from 'aws-sdk';
import { 
  User, 
  UserAttribute, 
  FormattedUser,
  UserManagementResponse
} from './types';

/**
 * Get user attribute value by name
 */
export function getUserAttributeValue(
  attributes: AWS.CognitoIdentityServiceProvider.AttributeType[] | UserAttribute[], 
  name: string
): string | undefined {
  const attribute = attributes.find(attr => attr.Name === name);
  return attribute ? attribute.Value : undefined;
}

/**
 * Format user from Cognito format to application format
 */
export function formatUser(user: User): FormattedUser {
  return {
    id: user.Username,
    username: user.Username,
    email: user.email,
    name: user.name,
    credits: user.credits,
    userGroups: user.userGroups,
    enabled: user.enabled,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

/**
 * Adapt Cognito response to our User interface
 */
export function adaptCognitoUserToUser(
  cognitoUser: AWS.CognitoIdentityServiceProvider.AdminGetUserResponse | AWS.CognitoIdentityServiceProvider.UserType, 
  groups: string[] = []
): User {
  // Handle the different attribute structures between AdminGetUserResponse and UserType
  let attributes: AWS.CognitoIdentityServiceProvider.AttributeType[] = [];
  
  if ('UserAttributes' in cognitoUser && cognitoUser.UserAttributes) {
    attributes = cognitoUser.UserAttributes;
  } else if ('Attributes' in cognitoUser && cognitoUser.Attributes) {
    attributes = cognitoUser.Attributes;
  }
  
  return {
    Username: cognitoUser.Username || '',
    email: getUserAttributeValue(attributes, 'email') || '',
    name: getUserAttributeValue(attributes, 'name'),
    credits: parseInt(getUserAttributeValue(attributes, 'custom:credits') || '0', 10),
    userGroups: groups,
    enabled: cognitoUser.Enabled,
    createdAt: cognitoUser.UserCreateDate ? cognitoUser.UserCreateDate.toISOString() : new Date().toISOString(),
    updatedAt: cognitoUser.UserLastModifiedDate ? cognitoUser.UserLastModifiedDate.toISOString() : new Date().toISOString()
  };
}

/**
 * Get list of user groups
 */
export async function getUserGroups(
  cognitoISP: AWS.CognitoIdentityServiceProvider,
  userPoolId: string, 
  username: string
): Promise<string[]> {
  try {
    const response = await cognitoISP.adminListGroupsForUser({
      UserPoolId: userPoolId,
      Username: username
    }).promise();
    
    return (response.Groups || []).map((group: AWS.CognitoIdentityServiceProvider.GroupType) => 
      group.GroupName || '').filter(Boolean);
  } catch (error) {
    console.error('Error fetching user groups:', error);
    return [];
  }
}

/**
 * Validates user pool ID and username
 */
export function validateBaseParams(params: { userPoolId: string; username: string }): string | null {
  if (!params.userPoolId) return 'User pool ID is required';
  if (!params.username) return 'Username is required';
  return null;
}

/**
 * Create error response
 */
export function createErrorResponse(message: string): UserManagementResponse {
  return {
    success: false,
    message
  };
}

/**
 * Create success response
 */
export function createSuccessResponse(data: Partial<UserManagementResponse> = {}): UserManagementResponse {
  return {
    success: true,
    ...data
  };
} 