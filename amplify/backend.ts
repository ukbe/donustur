import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { defaultBucket } from './storage/resource';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as lambda from 'aws-cdk-lib/aws-lambda';
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


backend.addUserToGroup.resources.lambda.addLayers(userManagementLayer);
backend.disableUser.resources.lambda.addLayers(userManagementLayer);
backend.enableUser.resources.lambda.addLayers(userManagementLayer);
backend.getUser.resources.lambda.addLayers(userManagementLayer);
backend.listUsers.resources.lambda.addLayers(userManagementLayer);
backend.removeUserFromGroup.resources.lambda.addLayers(userManagementLayer);
backend.updateUserAttributes.resources.lambda.addLayers(userManagementLayer);
