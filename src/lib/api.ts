import {generateClient} from 'aws-amplify/api';
import type {Schema} from '../../amplify/data/resource';
import './amplify-types'; // Import type extensions
import { 
  listUsersQuery, 
  getUserQuery,
  updateUserAttributesMutation,
  addUserToGroupMutation,
  removeUserFromGroupMutation,
  enableUserMutation,
  disableUserMutation,
  UserManagementResponse
} from './amplify-types';

export const client = generateClient<Schema>();

// Remove unused typedClient
// const typedClient = client as typeof client & {
//   queries: typeof client.queries & CustomQueries;
//   mutations: typeof client.mutations & CustomMutations;
// };

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
  const scans = await getUserScans(userId);
  return {
    totalCredits: scans.reduce((sum, scan) => sum + scan.credits, 0),
    totalScans: scans.length,
    usedCredits: 0, // Will implement with marketplace
  };
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
    // Get current user
    const userResponse = await client.models.User.get({ id: userId });
    const user = userResponse.data;
    
    if (!user) {
      console.error('User not found:', userId);
      return;
    }
    
    // Update total credits
    await client.models.User.update({
      id: userId,
      totalCredits: (user.totalCredits || 0) + creditsToAdd,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating user credits:', error);
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
    const responseJson = JSON.parse(result.data?.adminListUsers || '{}');
    
    // Check if the response indicates an error
    if (responseJson.success === false) {
      throw new Error(responseJson.message || 'Failed to list users');
    }
    
    return responseJson.users || [];
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
      variables: { id: userId },
      authMode: 'userPool'
    });
    
    // Parse the AWSJSON response
    const responseJson = JSON.parse(response.data?.adminGetUser || '{}');
    
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
    console.log('API: Updating user with ID:', userId, 'data:', data);
    
    // Use GraphQL mutation directly
    const response = await client.graphql({
      query: updateUserAttributesMutation,
      variables: {
        id: userId,
        attributes: JSON.stringify(data)  // Convert to AWSJSON string
      },
      authMode: 'userPool'
    });
    
    // Parse the AWSJSON response
    const result = JSON.parse(response.data?.updateUserAttributes || '{}') as UserManagementResponse;
    
    if (!result?.success) {
      throw new Error(result?.message || 'Failed to update user');
    }
    
    return result.user || null;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

// Add user to group (admin only)
export async function addUserToGroup(userId: string, groupName: string): Promise<void> {
  try {
    console.log(`API: Adding user ${userId} to group ${groupName}`);
    
    // Use GraphQL mutation directly
    const response = await client.graphql({
      query: addUserToGroupMutation,
      variables: {
        userId: userId,
        groupName: groupName
      },
      authMode: 'userPool'
    });
    
    // Parse the AWSJSON response
    const result = JSON.parse(response.data?.addUserToGroup || '{}') as UserManagementResponse;
    
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
    console.log(`API: Removing user ${userId} from group ${groupName}`);
    
    // Use GraphQL mutation directly
    const response = await client.graphql({
      query: removeUserFromGroupMutation,
      variables: {
        userId: userId,
        groupName: groupName
      },
      authMode: 'userPool'
    });
    
    // Parse the AWSJSON response
    const result = JSON.parse(response.data?.removeUserFromGroup || '{}') as UserManagementResponse;
    
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
    console.log('API: Disabling user with ID:', userId);
    
    // Use GraphQL mutation directly
    const response = await client.graphql({
      query: disableUserMutation,
      variables: {
        id: userId
      },
      authMode: 'userPool'
    });
    
    // Parse the AWSJSON response
    const result = JSON.parse(response.data?.disableUser || '{}') as UserManagementResponse;
    
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
    console.log('API: Enabling user with ID:', userId);
    
    // Use GraphQL mutation directly
    const response = await client.graphql({
      query: enableUserMutation,
      variables: {
        id: userId
      },
      authMode: 'userPool'
    });
    
    // Parse the AWSJSON response
    const result = JSON.parse(response.data?.enableUser || '{}') as UserManagementResponse;
    
    if (!result?.success) {
      throw new Error(result?.message || 'Failed to enable user');
    }
  } catch (error) {
    console.error('Error enabling user:', error);
    throw error;
  }
} 