export interface User {
  Username: string;
  email: string;
  name?: string;
  credits: number;
  userGroups: string[];
  enabled?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserAttribute {
  Name: string;
  Value: string;
}

export interface UserManagementResponse {
  success: boolean;
  message?: string;
  user?: User;
  users?: User[];
}

export interface AddUserToGroupParams {
  userPoolId: string;
  username: string;
  groupName: string;
}

export interface RemoveUserFromGroupParams {
  userPoolId: string;
  username: string;
  groupName: string;
}

export interface UpdateUserAttributesParams {
  userPoolId: string;
  username: string;
  userAttributes: {
    name?: string;
    email?: string;
    credits?: number;
    [key: string]: string | number | boolean | undefined;
  };
}

export interface EnableDisableUserParams {
  userPoolId: string;
  username: string;
}

export interface ListUsersParams {
  userPoolId: string;
  limit?: number;
  paginationToken?: string;
  filter?: string;
}

export interface GetUserParams {
  userPoolId: string;
  username: string;
}

export interface FormattedUser {
  id: string;
  username: string;
  email: string;
  name?: string;
  credits: number;
  userGroups: string[];
  enabled?: boolean;
  createdAt: string;
  updatedAt: string;
} 