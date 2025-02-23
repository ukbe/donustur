import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { defaultBucket } from './storage/resource';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
export const backend = defineBackend({
  auth,
  data,
  defaultBucket
});


const s3Bucket = backend.defaultBucket.resources.bucket;

new s3deploy.BucketDeployment(s3Bucket, 'UploadAssets', {
  sources: [s3deploy.Source.asset('./amplify/assets')],
  destinationBucket: s3Bucket,
  destinationKeyPrefix: '/'
});
