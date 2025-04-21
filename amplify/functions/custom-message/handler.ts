import type { CustomMessageTriggerHandler } from "aws-lambda";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({ region: process.env.REGION });

export const handler: CustomMessageTriggerHandler = async (event) => {
  console.log('Custom message event:', JSON.stringify(event, null, 2));

  let subject = "Dönüştür";
  let templateKey: string;
  const baseKey = `email-templates/auth/${event.triggerSource}.html`;


  // Determine the correct template key and subject based on the trigger
  switch (event.triggerSource) {
    case "CustomMessage_SignUp":
      templateKey = baseKey; // Use specific template if it exists
      subject = "Eposta adresini doğrula";
      break;
    case "CustomMessage_ResendCode":
      // Reuse the SignUp template for ResendCode
      templateKey = 'email-templates/auth/CustomMessage_SignUp.html'; 
      subject = "Eposta adresini doğrula"; // Use same subject
      break;
    case "CustomMessage_ForgotPassword":
      templateKey = baseKey;
      subject = "Şifreni sıfırla";
      break;
    // Add other specific cases if needed
    // case "CustomMessage_AdminCreateUser":
    // case "CustomMessage_UpdateUserAttribute":
    // case "CustomMessage_VerifyUserAttribute":
    // case "CustomMessage_Authentication":
    default:
      // Fallback to trigger source based key or a generic template
      templateKey = baseKey; 
      // Consider setting a generic subject or leaving the default
      console.warn(`Using default template key and subject for trigger: ${event.triggerSource}`);
      break;
  }
  
  const command = new GetObjectCommand({
    Bucket: process.env.DONUSTUR_TEMPLATES_BUCKET_NAME,
    Key: templateKey
  });
  
  const response = await s3Client.send(command);
  const emailTemplate = await response.Body?.transformToString();
  const code = event.request.codeParameter;

  if (!emailTemplate) {
    throw new Error("Failed to load email template");
  }

  event.response.emailMessage = emailTemplate
    .replace('${code}', code || '')

  event.response.emailSubject = subject;

  return event;
};
