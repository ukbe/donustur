import {generateClient} from 'aws-amplify/api';
import type {Schema} from '../../amplify/data/resource';
import { 
  listUsersQuery, 
  getUserQuery,
  addUserToGroupMutation,
  removeUserFromGroupMutation,
  enableUserMutation,
  disableUserMutation,
  UserManagementResponse
} from './amplify-types';

export const client = generateClient<Schema>();

export type Scan = {
  id: string;
  userId: string;
  timestamp: string;
  credits: number;
  binLocation: string;
};

export async function getUserScans(userId: string): Promise<Scan[]> {
  const response = await client.models.Scan.list({
    filter: {
      userId: {eq: userId}
    }
  });
  return response.data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function getUserStats(userId: string) {
  try {
    // Get all scans
    const scans = await getUserScans(userId);
    
    // Get all redemptions for this user
    const redemptionsResponse = await client.models.Redemption.list({
      filter: {
        userId: { eq: userId }
      }
    });
    
    const redemptions = redemptionsResponse.data;
    
    // Calculate used credits from redemptions
    const usedCredits = redemptions.reduce((sum, redemption) => sum + redemption.credits, 0);
    
    // Calculate total credits earned from scans
    const totalCredits = scans.reduce((sum, scan) => sum + scan.credits, 0);
    
    // Calculate available credits (total - used)
    const availableCredits = totalCredits - usedCredits;
    
    return {
      totalCredits,
      totalScans: scans.length,
      usedCredits,
      availableCredits
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return {
      totalCredits: 0,
      totalScans: 0,
      usedCredits: 0,
      availableCredits: 0
    };
  }
}

export type Bin = {
  id: string;
  name: string;
  location: string;
  credits: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
};

// Add GraphQL error interfaces
interface GraphQLError {
  errorType: string;
  message: string;
}

interface GraphQLResponse {
  errors?: GraphQLError[];
}

interface GraphQLErrorExtension extends Error {
  response?: GraphQLResponse;
}

export async function createBin(binData: {
  id: string;
  name: string;
  location: string;
  credits: number;
  status: 'active' | 'inactive';
}): Promise<Bin> {
  try {
    console.log('API: Creating bin with data:', binData);
    
    // Add timestamps
    const now = new Date().toISOString();
    const binWithTimestamps = {
      ...binData,
      createdAt: now,
      updatedAt: now,
    };
    
    const response = await client.models.Bin.create(binWithTimestamps);
    return response.data as Bin;
  } catch (error) {
    console.error('API: Error creating bin:', error);
    
    // Improved error handling for GraphQL errors
    if (error instanceof Error) {
      // Check if it's a GraphQL error with response property
      if ('response' in error && (error as unknown as GraphQLErrorExtension).response?.errors) {
        const gqlError = error as GraphQLErrorExtension;
        const errorDetails = JSON.stringify({ errors: gqlError.response?.errors });
        console.error('GraphQL error details:', errorDetails);
        throw new Error(errorDetails);
      }
      
      // Check if it already has an errors array in the message (sometimes AWS returns it directly)
      if (error.message && (error.message.includes('errors') || error.message.includes('Permission denied'))) {
        try {
          const errorData = JSON.parse(error.message);
          if (errorData.errors) {
            console.error('Error message contains errors array:', errorData);
            throw error; // Already formatted correctly
          }
        } catch {
          // Not a valid JSON, continue with original error
        }
      }
    }
    
    throw error;
  }
}

export async function listBins(): Promise<Bin[]> {
  const response = await client.models.Bin.list();
  return response.data as unknown as Bin[];
}

export async function getBin(binId: string): Promise<Bin | null> {
  try {
    const response = await client.models.Bin.get({ id: binId });
    return response.data as Bin;
  } catch (error) {
    console.error('Error getting bin:', error);
    return null;
  }
}

export type ScanInput = {
  userId: string;
  binId: string;
  binLocation: string;
  credits: number;
  timestamp: string;
};

export async function createScan(scan: ScanInput): Promise<Scan> {  
  const response = await client.models.Scan.create({
    userId: scan.userId,
    timestamp: scan.timestamp,
    credits: scan.credits,
    binLocation: scan.binLocation,
    binId: scan.binId
  });
  
  // Update user's total credits
  await updateUserCredits(scan.userId, scan.credits);
  
  return response.data as Scan;
}

export async function updateUserCredits(userId: string, creditsToAdd: number): Promise<void> {
  try {
    // Validate userId
    if (!userId) {
      throw new Error('User ID is required for updating credits');
    }
    
    console.log('Updating credits for user ID:', userId);
    
    // Get current user
    const userResponse = await client.models.User.get({ id: userId });
    let user = userResponse.data;
    
    if (!user) {
      console.log('User not found, creating new user record:', userId);
      
      // Create a new user record with minimal information
      const now = new Date().toISOString();
      const newUserData = {
        id: userId,
        email: `user_${userId}@example.com`, // Placeholder email
        totalCredits: 0,
        createdAt: now,
        updatedAt: now
      };
      
      const createResponse = await client.models.User.create(newUserData);
      user = createResponse.data;
      
      if (!user) {
        throw new Error(`Failed to create user: "${userId}"`);
      }
    }
    
    console.log('Updating user credits:', userId, 'Current credits:', user.totalCredits, 'Adding:', creditsToAdd);
    
    // Update total credits
    await client.models.User.update({
      id: userId,
      totalCredits: (user.totalCredits || 0) + creditsToAdd,
      updatedAt: new Date().toISOString(),
    });
    
    console.log('Credits updated successfully for user:', userId);
  } catch (error) {
    console.error('Error updating user credits:', error);
    throw error;
  }
}

export async function updateBin(
  binId: string,
  data: {
    name?: string;
    location?: string;
    credits?: number;
    status?: 'active' | 'inactive';
  }
): Promise<Bin> {
  try {
    console.log('API: Updating bin with ID:', binId, 'data:', data);
    
    // Add updatedAt timestamp
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    const response = await client.models.Bin.update({
      id: binId,
      ...updateData
    });
    
    return response.data as Bin;
  } catch (error) {
    console.error('API: Error updating bin:', error);
    
    // Improved error handling for GraphQL errors
    if (error instanceof Error) {
      // Check if it's a GraphQL error with response property
      if ('response' in error && (error as unknown as GraphQLErrorExtension).response?.errors) {
        const gqlError = error as GraphQLErrorExtension;
        const errorDetails = JSON.stringify({ errors: gqlError.response?.errors });
        console.error('GraphQL error details:', errorDetails);
        throw new Error(errorDetails);
      }
      
      // Check if it already has an errors array in the message
      if (error.message && (error.message.includes('errors') || error.message.includes('Permission denied'))) {
        try {
          const errorData = JSON.parse(error.message);
          if (errorData.errors) {
            console.error('Error message contains errors array:', errorData);
            throw error; // Already formatted correctly
          }
        } catch {
          // Not a valid JSON, continue with original error
        }
      }
    }
    
    throw error;
  }
}

export async function deleteBin(binId: string): Promise<void> {
  try {
    console.log('API: Deleting bin with ID:', binId);
    
    await client.models.Bin.delete({
      id: binId
    });
    
  } catch (error) {
    console.error('API: Error deleting bin:', error);
    
    // Improved error handling for GraphQL errors
    if (error instanceof Error) {
      // Check if it's a GraphQL error with response property
      if ('response' in error && (error as unknown as GraphQLErrorExtension).response?.errors) {
        const gqlError = error as GraphQLErrorExtension;
        const errorDetails = JSON.stringify({ errors: gqlError.response?.errors });
        console.error('GraphQL error details:', errorDetails);
        throw new Error(errorDetails);
      }
      
      // Check if it already has an errors array in the message
      if (error.message && (error.message.includes('errors') || error.message.includes('Permission denied'))) {
        try {
          const errorData = JSON.parse(error.message);
          if (errorData.errors) {
            console.error('Error message contains errors array:', errorData);
            throw error; // Already formatted correctly
          }
        } catch {
          // Not a valid JSON, continue with original error
        }
      }
    }
    
    throw error;
  }
}

export type User = {
  id: string;
  username: string;
  email: string;
  name?: string;
  credits: number;
  userGroups: string[];
  enabled?: boolean;
  createdAt: string;
  updatedAt: string;
};

// List all users (admin only)
export async function listUsers(): Promise<User[]> {
  try {
    console.log('API: Listing users');
    
    // Use GraphQL query directly with type assertion
    const result = await client.graphql({
      query: listUsersQuery,
      authMode: 'userPool'
    });
    
    // Parse the AWSJSON response
    const responseJson = JSON.parse((result as { data?: { adminListUsers?: string } }).data?.adminListUsers || '{}');
    
    // Check if the response indicates an error
    if (responseJson.success === false) {
      throw new Error(responseJson.message || 'Failed to list users');
    }
    
    // Get users from Cognito (which have groups info but zero credits)
    const cognitoUsers = responseJson.users || [];
    
    // Now get all users from DynamoDB to get accurate credit information
    const dynamoUsersResponse = await client.models.User.list();
    const dynamoUsers = dynamoUsersResponse.data || [];
    
    // Create a map of user IDs to totalCredits from DynamoDB
    const creditsMap = new Map<string, number>();
    dynamoUsers.forEach(user => {
      creditsMap.set(user.id, user.totalCredits || 0);
    });
    
    // Merge DynamoDB credit information with Cognito user data
    const mergedUsers = cognitoUsers.map((user: { id?: string; Username?: string; credits?: number } & Record<string, unknown>) => {
      // In the Cognito response, the ID may be in either 'Username' or 'id'
      // User type in API has 'id' but the Cognito response has 'Username'
      const userId = user.id || user.Username || '';
      
      return {
        ...user,
        // Make sure we have an id field for consistency
        id: userId,
        // Use DynamoDB totalCredits if available, otherwise fallback to Cognito credits (likely 0)
        credits: userId && creditsMap.has(userId) ? creditsMap.get(userId) as number : (user.credits as number || 0)
      };
    });
    
    return mergedUsers;
  } catch (error) {
    console.error('Error listing users:', error);
    throw error;
  }
}

// Get a single user by ID (admin only)
export async function getUser(userId: string): Promise<User | null> {
  try {
    console.log('API: Getting user with ID:', userId);
    
    // Use GraphQL query directly
    const response = await client.graphql({
      query: getUserQuery,
      variables: { userId },
      authMode: 'userPool'
    });
    
    // Parse the AWSJSON response
    const responseJson = JSON.parse((response as { data?: { adminGetUser?: string } }).data?.adminGetUser || '{}');
    
    // Check if the response indicates an error
    if (responseJson.success === false) {
      throw new Error(responseJson.message || 'Failed to get user');
    }
    
    return responseJson.user || null;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
}

// Update user attributes (admin only)
export async function updateUser(
  userId: string,
  data: {
    name?: string;
    credits?: number;
    email?: string;
  }
): Promise<User | null> {
  try {
    console.log('API: Updating user attributes for user:', userId, data);
    
    // Ensure credits is a valid number
    if (data.credits !== undefined) {
      if (data.credits === null || isNaN(data.credits)) {
        data.credits = 0;
      }
    }
    
    // Transform data to match DynamoDB schema (convert credits to totalCredits)
    const dynamoData: {
      name?: string;
      totalCredits?: number;
      email?: string;
    } = {
      name: data.name,
      email: data.email
    };
    
    // Only add totalCredits if credits was provided
    if (data.credits !== undefined) {
      dynamoData.totalCredits = data.credits;
    }
    
    // Use the direct DynamoDB update function
    const updatedData = await updateUserDynamoDB(userId, dynamoData);
    
    if (!updatedData) {
      throw new Error('Failed to update user');
    }
    
    // Get the updated user to ensure we return the correct format
    const user = await getUserById(userId);
    
    return user;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

// Add user to group (admin only)
export async function addUserToGroup(userId: string, groupName: string): Promise<void> {
  try {
    console.log('API: Adding user to group:', userId, groupName);
    
    const response = await client.graphql({
      query: addUserToGroupMutation,
      variables: { 
        userId, 
        groupName 
      },
      authMode: 'userPool'
    });
    
    // Parse the AWSJSON response
    const result = JSON.parse((response as { data?: { addUserToGroup?: string } }).data?.addUserToGroup || '{}') as UserManagementResponse;
    
    if (!result?.success) {
      throw new Error(result?.message || 'Failed to add user to group');
    }
  } catch (error) {
    console.error('Error adding user to group:', error);
    throw error;
  }
}

// Remove user from group (admin only)
export async function removeUserFromGroup(userId: string, groupName: string): Promise<void> {
  try {
    console.log('API: Removing user from group:', userId, groupName);
    
    const response = await client.graphql({
      query: removeUserFromGroupMutation,
      variables: { 
        userId, 
        groupName 
      },
      authMode: 'userPool'
    });
    
    // Parse the AWSJSON response
    const result = JSON.parse((response as { data?: { removeUserFromGroup?: string } }).data?.removeUserFromGroup || '{}') as UserManagementResponse;
    
    if (!result?.success) {
      throw new Error(result?.message || 'Failed to remove user from group');
    }
  } catch (error) {
    console.error('Error removing user from group:', error);
    throw error;
  }
}

// Disable user (admin only)
export async function disableUser(userId: string): Promise<void> {
  try {
    console.log('API: Disabling user:', userId);
    
    const response = await client.graphql({
      query: disableUserMutation,
      variables: { userId },
      authMode: 'userPool'
    });
    
    // Parse the AWSJSON response
    const result = JSON.parse((response as { data?: { disableUser?: string } }).data?.disableUser || '{}') as UserManagementResponse;
    
    if (!result?.success) {
      throw new Error(result?.message || 'Failed to disable user');
    }
  } catch (error) {
    console.error('Error disabling user:', error);
    throw error;
  }
}

// Enable user (admin only)
export async function enableUser(userId: string): Promise<void> {
  try {
    console.log('API: Enabling user:', userId);
    
    const response = await client.graphql({
      query: enableUserMutation,
      variables: { userId },
      authMode: 'userPool'
    });
    
    // Parse the AWSJSON response
    const result = JSON.parse((response as { data?: { enableUser?: string } }).data?.enableUser || '{}') as UserManagementResponse;
    
    if (!result?.success) {
      throw new Error(result?.message || 'Failed to enable user');
    }
  } catch (error) {
    console.error('Error enabling user:', error);
    throw error;
  }
}

export type Cause = {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
  credits: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
};

// Create a new cause
export async function createCause(causeData: {
  name: string;
  description: string;
  logoUrl: string;
  credits: number;
  status: 'active' | 'inactive';
}): Promise<Cause> {
  const response = await client.models.Cause.create(causeData);
  return response.data as Cause;
}

// List all causes, optionally filtering to only active ones
export async function listCauses(activeOnly = false): Promise<Cause[]> {
  try {
    let filter = undefined;
    if (activeOnly) {
      filter = {
        status: { eq: 'active' }
      }
    }
    
    const response = await client.models.Cause.list({ filter });
    const causes = response.data as Cause[];
    
    return causes;
  } catch (error) {
    console.error('Error listing causes:', error);
    throw error;
  }
}

export async function getCause(causeId: string): Promise<Cause | null> {
  try {
    const response = await client.models.Cause.get({ id: causeId });
    return response.data as Cause || null;
  } catch (error) {
    console.error('Error getting cause:', error);
    return null;
  }
}

export async function updateCause(
  causeId: string,
  data: {
    name?: string;
    description?: string;
    logoUrl?: string;
    credits?: number;
    status?: 'active' | 'inactive';
  }
): Promise<Cause> {
  const response = await client.models.Cause.update({
    id: causeId,
    ...data
  }) as unknown as { data: Cause };
  
  return response.data;
}

export async function deleteCause(causeId: string): Promise<void> {
  try {
    await client.models.Cause.delete({ id: causeId });
  } catch (error) {
    console.error('Error deleting cause:', error);
    throw error;
  }
}

// User redemption - Support a cause
export async function redeemForCause(userId: string, causeId: string, credits: number): Promise<void> {
  try {
    console.log('API: Redeeming credits for cause:', {userId, causeId, credits});
    
    // 1. Get user data to check credits
    const user = await getUserById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Ensure user credits is a number
    const userCredits = typeof user.credits === 'number' ? user.credits : 0;
    
    if (userCredits < credits) {
      throw new Error('Insufficient credits');
    }
    
    console.log('User has sufficient credits:', {userCredits, redemptionCredits: credits});
    
    // 2. Create a redemption record
    await client.models.Redemption.create({
      userId,
      itemId: causeId,
      credits,
      timestamp: new Date().toISOString()
    }) as unknown;
    
    console.log('Redemption record created successfully');
    
    // 3. Update user's credits
    const newCredits = userCredits - credits;
    console.log('Updating user credits from', userCredits, 'to', newCredits);
    
    // Use updateUserDynamoDB instead of updateUser to avoid Cognito attribute issues
    await updateUserDynamoDB(userId, {
      totalCredits: newCredits
    });
    
    console.log('User credits updated successfully');
    
  } catch (error) {
    console.error('Error redeeming for cause:', error);
    throw error;
  }
}

// Add a function to create a user record
export async function createUser(userData: {
  id: string;
  email: string;
  totalCredits: number;
  name?: string;
}): Promise<unknown> {
  try {
    // Validate required fields
    if (!userData.id) {
      throw new Error('User ID is required');
    }
    
    if (!userData.email) {
      throw new Error('Email is required');
    }
    
    console.log('Creating user with data:', userData);
    
    // Add timestamps
    const now = new Date().toISOString();
    const userWithTimestamps = {
      ...userData,
      createdAt: now,
      updatedAt: now,
    };
    
    console.log('Sending create request with data:', JSON.stringify(userWithTimestamps));
    
    const response = await client.models.User.create(userWithTimestamps);
    console.log('User created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    
    // Try to extract more detailed error information
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // Try to parse GraphQL errors from the message
      try {
        const errorData = JSON.parse(error.message);
        console.error('Parsed error data:', errorData);
      } catch {
        // If parsing fails, it's not a JSON error message
        console.error('Error is not in JSON format');
      }
    }
    
    throw error;
  }
}

// Get a single user by ID (for regular users)
export async function getUserById(userId: string): Promise<User | null> {
  try {
    console.log('API: Getting user with ID (direct):', userId);
    
    if (!userId) {
      console.error('getUserById called with empty userId');
      return null;
    }
    
    // Use the User model directly
    const response = await client.models.User.get({ id: userId });
    
    if (!response.data) {
      console.log('User not found:', userId);
      return null;
    }
    
    console.log('User found:', response.data);
    
    // Convert the model response to User type
    const userData = response.data;
    return {
      id: userData.id,
      username: userData.email.split('@')[0], // Use email as username if not available
      email: userData.email,
      name: userData.name || '',
      credits: userData.totalCredits || 0,
      userGroups: [], // Not available in direct model access
      enabled: true, // Assume enabled
      createdAt: userData.createdAt || new Date().toISOString(),
      updatedAt: userData.updatedAt || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

// Update user directly in DynamoDB (bypass Cognito user attributes)
export async function updateUserDynamoDB(
  userId: string,
  data: {
    name?: string;
    totalCredits?: number;
    email?: string;
  }
): Promise<unknown> {
  try {
    console.log('API: Updating user in DynamoDB:', userId, data);
    
    // Ensure data is valid
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    if (Object.keys(data).length === 0) {
      throw new Error('At least one attribute must be provided for update');
    }
    
    // Add updated timestamp
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    // Update the user record directly using the DynamoDB model
    const response = await client.models.User.update({
      id: userId,
      ...updateData
    });
    
    console.log('User updated successfully in DynamoDB:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating user in DynamoDB:', error);
    throw error;
  }
}

// Get admin dashboard statistics
export async function getAdminStats(): Promise<{
  totalUsers: number;
  totalScans: number;
  totalCredits: number;
  totalRedemptions: number;
  activeBins: number;
  totalBins: number;
}> {
  try {
    console.log('API: Getting admin dashboard statistics');

    // Fetch users
    const users = await listUsers();
    
    // Initialize counters
    let totalScans = 0;
    let totalCredits = 0;
    let totalRedemptions = 0;
    
    // Fetch scans from all users
    const scanPromises = users.map(async (user) => {
      const userScans = await getUserScans(user.id);
      return userScans;
    });
    
    const allUserScans = await Promise.all(scanPromises);
    const scans = allUserScans.flat();
    totalScans = scans.length;
    
    // Sum up credits from all scans
    totalCredits = scans.reduce((sum, scan) => sum + scan.credits, 0);
    
    // Fetch redemptions for all users
    const redemptionPromises = users.map(async (user) => {
      try {
        const redemptionsResponse = await client.models.Redemption.list({
          filter: {
            userId: {
              eq: user.id
            }
          }
        });
        return redemptionsResponse.data;
      } catch (error) {
        console.error(`Error fetching redemptions for user ${user.id}:`, error);
        return [];
      }
    });
    
    const allUserRedemptions = await Promise.all(redemptionPromises);
    const redemptions = allUserRedemptions.flat();
    totalRedemptions = redemptions.length;
    
    // Fetch bins
    const bins = await listBins();
    const activeBins = bins.filter(bin => bin.status === 'active').length;
    
    return {
      totalUsers: users.length,
      totalScans,
      totalCredits,
      totalRedemptions,
      activeBins,
      totalBins: bins.length
    };
  } catch (error) {
    console.error('Error getting admin statistics:', error);
    // Return default values in case of error
    return {
      totalUsers: 0,
      totalScans: 0,
      totalCredits: 0,
      totalRedemptions: 0,
      activeBins: 0,
      totalBins: 0
    };
  }
} 