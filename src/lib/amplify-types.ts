import { User } from './api';

// Define the extended client operations for TypeScript

export interface UserManagementResponse {
  success: boolean;
  message?: string;
  user?: User;
}

export interface CustomQueries {
  listUsers: () => Promise<{ data: User[] }>;
  getUser: (params: { id: string }) => Promise<{ data: User | null }>;
}

export interface CustomMutations {
  updateUserAttributes: (params: { 
    id: string; 
    attributes: { 
      name?: string; 
      email?: string; 
      credits?: number 
    } 
  }) => Promise<{ data: UserManagementResponse }>;
  
  addUserToGroup: (params: { 
    id: string; 
    group: string 
  }) => Promise<{ data: UserManagementResponse }>;
  
  removeUserFromGroup: (params: { 
    id: string; 
    group: string 
  }) => Promise<{ data: UserManagementResponse }>;
  
  enableUser: (params: { 
    id: string 
  }) => Promise<{ data: UserManagementResponse }>;
  
  disableUser: (params: { 
    id: string 
  }) => Promise<{ data: UserManagementResponse }>;
}

// GraphQL operation texts
export const listUsersQuery = /* GraphQL */ `
  query AdminListUsers {
    adminListUsers
  }
`;

export const getUserQuery = /* GraphQL */ `
  query AdminGetUser($id: String!) {
    adminGetUser(id: $id)
  }
`;

export const updateUserAttributesMutation = /* GraphQL */ `
  mutation UpdateUserAttributes($id: String!, $attributes: AWSJSON!) {
    updateUserAttributes(id: $id, attributes: $attributes)
  }
`;

export const addUserToGroupMutation = /* GraphQL */ `
  mutation AddUserToGroup($userId: String!, $groupName: String!) {
    addUserToGroup(userId: $userId, groupName: $groupName)
  }
`;

export const removeUserFromGroupMutation = /* GraphQL */ `
  mutation RemoveUserFromGroup($userId: String!, $groupName: String!) {
    removeUserFromGroup(userId: $userId, groupName: $groupName)
  }
`;

export const enableUserMutation = /* GraphQL */ `
  mutation EnableUser($id: String!) {
    enableUser(id: $id)
  }
`;

export const disableUserMutation = /* GraphQL */ `
  mutation DisableUser($id: String!) {
    disableUser(id: $id)
  }
`;

// Extend the generated client type
declare module 'aws-amplify/api' {
  interface GeneratedClient<T> {
    queries: T & CustomQueries;
    mutations: T & CustomMutations;
  }
} 