import * as jose from 'jose';

const GOOGLE_AUTH_URL = 'https://oauth2.googleapis.com/token';
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

export async function getGoogleAccessToken() {
  const clientEmail = process.env.GCP_CLIENT_EMAIL;
  const privateKey = process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) {
    throw new Error('GCP credentials missing in environment variables');
  }

  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600;

  const payload = {
    iss: clientEmail,
    scope: SCOPES.join(' '),
    aud: GOOGLE_AUTH_URL,
    exp,
    iat,
  };

  const pkcs8 = await jose.importPKCS8(privateKey, 'RS256');
  
  const jwt = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .setIssuer(clientEmail)
    .setAudience(GOOGLE_AUTH_URL)
    .sign(pkcs8);

  const response = await fetch(GOOGLE_AUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to get Google access token: ${data.error_description || data.error}`);
  }

  return data.access_token;
}
