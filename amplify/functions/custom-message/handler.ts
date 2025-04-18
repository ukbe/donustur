import type { CustomMessageTriggerHandler } from "aws-lambda";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({ region: process.env.REGION });

export const handler: CustomMessageTriggerHandler = async (event) => {
  console.log('Custom message event:', JSON.stringify(event, null, 2));
  
  const command = new GetObjectCommand({
    Bucket: process.env.DONUSTUR_TEMPLATES_BUCKET_NAME,
    Key: `email-templates/auth/${event.triggerSource}.html`
  });
  
  const response = await s3Client.send(command);
  const emailTemplate = await response.Body?.transformToString();
  const code = event.request.codeParameter;

  if (!emailTemplate) {
    throw new Error("Failed to load email template");
  }

  event.response.emailMessage = emailTemplate
    .replace('${code}', code || '')

  let subject = "Dönüştür";

  switch (event.triggerSource) {
    case "CustomMessage_SignUp":
      subject = "Eposta adresini doğrula - Dönüştür";
      break;
    case "CustomMessage_ResendCode":
      subject = "Eposta adresini doğrula - Dönüştür";
      break;
    case "CustomMessage_ForgotPassword":
      subject = "Şifreni sıfırla - Dönüştür";
      break;
    case "CustomMessage_AdminCreateUser":
      subject = "Eposta adresini doğrula - Dönüştür";
      break;
    case "CustomMessage_UpdateUserAttribute":
      subject = "Eposta adresini doğrula - Dönüştür";
      break;
    case "CustomMessage_VerifyUserAttribute":
      subject = "Eposta adresini doğrula - Dönüştür";
      break;
    case "CustomMessage_Authentication":
      subject = "Eposta adresini doğrula - Dönüştür";
      break;
  }

  event.response.emailSubject = subject;

  return event;
};
