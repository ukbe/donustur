import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { defaultBucket } from './storage/resource';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import { data } from './data/resource';
import { addUserToGroup } from './functions/user/add-user-to-group/resource';
import { disableUser } from './functions/user/disable-user/resource';
import { enableUser } from './functions/user/enable-user/resource';
import { getUser } from './functions/user/get-user/resource';
import { listUsers } from './functions/user/list-users/resource';
import { removeUserFromGroup } from './functions/user/remove-user-from-group/resource';
import { updateUserAttributes } from './functions/user/update-user-attributes/resource';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
export const backend = defineBackend({
  auth,
  data,
  defaultBucket,
  addUserToGroup,
  disableUser,
  enableUser,
  getUser,
  listUsers,
  removeUserFromGroup,
  updateUserAttributes
});

const s3Bucket = backend.defaultBucket.resources.bucket;

new s3deploy.BucketDeployment(s3Bucket, 'UploadAssets', {
  sources: [s3deploy.Source.asset('./amplify/assets')],
  destinationBucket: s3Bucket,
  destinationKeyPrefix: '/'
});

export const userManagementLayer = new lambda.LayerVersion(backend.stack, 'ManageUsersLayer', {
  layerVersionName: 'manage-users',
  code: lambda.Code.fromAsset('./amplify/layers/manage-users/dist'),
});

// Get User Pool ID from the Auth resource
const userPoolId = backend.auth.resources.userPool.userPoolId;

// Create a policy allowing access to Cognito operations
const cognitoPolicy = new iam.PolicyStatement({
  effect: iam.Effect.ALLOW,
  actions: [
    'cognito-idp:ListUsers',
    'cognito-idp:AdminGetUser',
    'cognito-idp:AdminAddUserToGroup',
    'cognito-idp:AdminRemoveUserFromGroup',
    'cognito-idp:AdminUpdateUserAttributes',
    'cognito-idp:AdminEnableUser',
    'cognito-idp:AdminDisableUser',
    'cognito-idp:AdminListGroupsForUser'
  ],
  resources: [`arn:aws:cognito-idp:*:*:userpool/${userPoolId}`]
});

// Add layers and environment variables to all user management Lambda functions
const userManagementFunctions = [
  backend.addUserToGroup.resources.lambda,
  backend.disableUser.resources.lambda,
  backend.enableUser.resources.lambda,
  backend.getUser.resources.lambda,
  backend.listUsers.resources.lambda,
  backend.removeUserFromGroup.resources.lambda,
  backend.updateUserAttributes.resources.lambda
];

// Add layer and environment variables to each function
userManagementFunctions.forEach(lambdaFunction => {
  // Add the layer
  (lambdaFunction as lambda.Function).addLayers(userManagementLayer);
  
  // Add environment variables
  (lambdaFunction as lambda.Function).addEnvironment('AMPLIFY_AUTH_USERPOOL_ID', userPoolId);
  
  // Add IAM permissions
  lambdaFunction.addToRolePolicy(cognitoPolicy);
});
