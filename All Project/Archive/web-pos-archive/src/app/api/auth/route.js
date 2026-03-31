// export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import { success, error, serverError } from '@/lib/api-response';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'rizan_thrift_pos_secret_senior_transformation_overnight'
);

import { getFirst } from '@/lib/db';

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    const user = await getFirst('SELECT * FROM staff WHERE username = ? AND is_active = 1', [username]);

    if (!user) {
      return error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', 401);
    }

    let isValid = false;

    // Temporary migration fallback for seeded data
    if (user.password_hash === 'hashed_pw' && password === 'rizan123') {
      isValid = true;
    } else {
      // Production SHA-256 hash check
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      if (user.password_hash === hashHex) {
        isValid = true;
      }
    }

    if (isValid) {
      const token = await new SignJWT({ username: user.username, role: user.role })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(JWT_SECRET);

      const response = success({ user: { username: user.username, role: user.role } });
      
      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 1 day
        path: '/',
      });

      return response;
    }

    return error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', 401);
  } catch (err) {
    return serverError(err);
  }
}

export async function DELETE() {
  const response = success();
  response.cookies.delete('token');
  return response;
}


