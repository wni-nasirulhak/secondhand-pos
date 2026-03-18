import { success, error, serverError } from '@/lib/api-response';

/**
 * Cloudinary unsigned upload proxy
 */
export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return error('No file provided', 400);
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'domga8omv';
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || 'rizan_pos_unsigned';

    const cloudFormData = new FormData();
    cloudFormData.append('file', file);
    cloudFormData.append('upload_preset', uploadPreset);
    cloudFormData.append('folder', 'rizan-thrift-pos');

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: cloudFormData,
    });

    if (!res.ok) {
      const errText = await res.text();
      let errorMessage = 'Upload failed. Ensure Cloudinary settings are correct.';
      try {
        const errJson = JSON.parse(errText);
        errorMessage = `Cloudinary Error: ${errJson.error?.message || errText}`;
      } catch (e) {
        errorMessage = `Cloudinary Error: ${errText}`;
      }
      
      console.error('Cloudinary upload error:', errText);
      return error(errorMessage, 400);
    }

    const data = await res.json();
    return success({ url: data.secure_url, public_id: data.public_id });
  } catch (err) {
    return serverError(err);
  }
}
