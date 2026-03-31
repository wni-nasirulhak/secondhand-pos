export const dynamic = 'force-dynamic';

import { success, error, serverError } from '@/lib/api-response';
import { processCheckout } from '@/services/checkoutService';

export async function POST(req) {
  try {
    const payload = await req.json();
    const result = await processCheckout(payload);
    return success(result);
  } catch (err) {
    if (err.message === 'Cart is empty' || err.message.includes('แต้มไม่ถึง') || err.message.includes('no longer available')) {
      return error(err.message, 400);
    }
    return serverError(err);
  }
}
