import type { PostConfirmationTriggerHandler } from "aws-lambda";
import { type Schema } from "../../data/resource";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from "$amplify/env/post-confirmation";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(
  env
);

Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

export const handler: PostConfirmationTriggerHandler = async (event) => {
  console.log("Post confirmation event:", JSON.stringify(event, null, 2));
  
  try {
    // Extract user attributes
    const { email, sub: userId, name } = event.request.userAttributes;
    
    // Check if user already exists
    try {
      const existingUser = await client.models.User.get({ id: userId });
      if (existingUser.data) {
        console.log("User already exists:", userId);
        return event;
      }
    } catch (error) {
      console.log("Error checking for existing user:", error);
      // Continue to create user if not found
    }
    
    // Create user record
    const now = new Date().toISOString();
    const userData = {
      id: userId,
      email: email,
      totalCredits: 0,
      name: name || email.split('@')[0], // Use name if available, otherwise use email username
      createdAt: now,
      updatedAt: now,
      owner: `${userId}:${email}`
    };
    
    console.log("Creating user with data:", userData);
    
    const result = await client.models.User.create(userData);
    console.log("User created successfully:", result.data);
  } catch (error) {
    console.error("Error creating user in post-confirmation:", error);
    // Don't throw error to prevent sign-up failure
    // Just log the error and continue
  }

  return event;
};