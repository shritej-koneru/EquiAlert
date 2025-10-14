import twilio from 'twilio';
function getCredentials() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const apiKey = process.env.TWILIO_API_KEY;
  const apiKeySecret = process.env.TWILIO_API_KEY_SECRET;
  const phoneNumber = process.env.TWILIO_PHONE_NUMBER;
  if (!accountSid || !apiKey || !apiKeySecret || !phoneNumber) {
    throw new Error('Twilio credentials missing in .env');
  }
  return {
    accountSid,
    apiKey,
    apiKeySecret,
    phoneNumber
  };
}


export function getTwilioClient() {
  const { accountSid, apiKey, apiKeySecret } = getCredentials();
  return twilio(apiKey, apiKeySecret, {
    accountSid: accountSid
  });
}

export function getTwilioFromPhoneNumber() {
  const { phoneNumber } = getCredentials();
  return phoneNumber;
}
