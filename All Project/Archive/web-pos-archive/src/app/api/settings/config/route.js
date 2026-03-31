import { getConfig, saveConfig } from '@/services/settingsService';

export const runtime = 'edge';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    if (!key) return Response.json({ error: 'Key is required' }, { status: 400 });
    
    const data = await getConfig(key);
    return Response.json({ data });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { key, value } = body;
    if (!key) return Response.json({ error: 'Key is required' }, { status: 400 });
    
    await saveConfig(key, value);
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
