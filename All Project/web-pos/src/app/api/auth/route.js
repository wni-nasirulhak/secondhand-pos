import { success, error, serverError } from '@/lib/api-response';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'rizan_thrift_pos_secret_senior_transformation_overnight'
);

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    if (username === 'admin' && password === 'rizan123') {
      const token = await new SignJWT({ username, role: 'Admin' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(JWT_SECRET);

      const response = success({ user: { username, role: 'Admin' } });
      
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
