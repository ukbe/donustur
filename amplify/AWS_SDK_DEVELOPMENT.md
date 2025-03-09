# AWS SDK Development Guide

This document explains how to handle AWS SDK for TypeScript linting and deployment.

## Understanding the Approach

1. **Lambda Runtime Provides AWS SDK:**
   - AWS Lambda runtime already includes `aws-sdk`, so we don't need to deploy it
   - This saves deployment size and ensures we use the latest version available in Lambda

2. **Development Time Type Checking:**
   - We need AWS SDK types during development for TypeScript validation 
   - The types are included as dev dependencies only

## How This Works

1. **Package.json Configuration:**
   - `aws-sdk` is in **devDependencies** (not in dependencies)
   - TypeScript can find the types during development
   - Our build process ensures aws-sdk isn't bundled for deployment

2. **Type Declarations:**
   - The `aws-sdk.d.ts` file provides module declarations for development
   - This helps TypeScript locate the types without affecting runtime

3. **Build Process:**
   - Development: All dependencies are installed for TypeScript compilation
   - Deployment: Only production dependencies are included (not aws-sdk)

## Running TypeScript Validation

For validating TypeScript without errors:

```bash
# Fix type errors by making sure aws-sdk types are available for development
npm install --prefix amplify/layers/manage-users/nodejs

# Run TypeScript validation with skipLibCheck to avoid deep checking in aws-sdk
npx tsc --noEmit --skipLibCheck --project amplify
```

## Deploying to Amplify

```bash
# Build the layer properly (without including aws-sdk)
./amplify/rebuild-layer.sh

# Deploy to Amplify
amplify sandbox
# or
amplify push
```

## Troubleshooting

If you encounter AWS SDK type errors:

1. Make sure `@types/aws-sdk` is installed as a dev dependency
2. Check that `tsconfig.json` includes the proper paths and types
3. Run the rebuild script to ensure everything is properly built 