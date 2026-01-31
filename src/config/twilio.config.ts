import { registerAs } from '@nestjs/config';

export default registerAs('twilio', () => ({
  accountSid: process.env.TWILIO_ACCOUNT_SID || "SK2edd42fa930d954bc06c87d0e4f50c41",
  authToken: process.env.TWILIO_AUTH_TOKEN || "ntkUwmg1l0FoAdFuBmqgUDhPx4mEJRED",
  phoneNumber: process.env.TWILIO_PHONE_NUMBER || "+18583269935",
  // enabled: process.env.TWILIO_ENABLED === 'true',
  enabled: true,
}));

console.log("twilio is ", process.env.TWILIO_ENABLED === 'true' ? 'enabled' : 'disabled');


// secret ntkUwmg1l0FoAdFuBmqgUDhPx4mEJRED
// sid SK2edd42fa930d954bc06c87d0e4f50c41