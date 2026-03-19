/**
 * Senior-level Utility Library
 */

/**
 * Transforms Cloudinary URLs for optimized delivery (width, height, fill, auto-format).
 */
export function thumbUrl(src, w = 300) {
  if (!src || !src.includes('cloudinary.com')) return src;
  return src.replace('/upload/', `/upload/w_${w},h_${w},c_fill,q_auto/`);
}

/**
 * Normalizes image sources from various product data fields (Photos, Photo, Image_URL).
 * Handles stringified JSON, CSV strings, and base64.
 */
export function getImgSrcs(item) {
  if (!item) return [];
  
  // 1. New multiple photos field
  if (item.Photos && typeof item.Photos === 'string') {
    return item.Photos.split(',').filter(Boolean).map(s => s.trim());
  }
  
  // 2. Fallback fields
  const photoField = item.Photo || item.Image_URL || item.photo || item.image_url;
  if (!photoField || photoField === '0' || photoField === 'None') return [];
  
  const s = String(photoField).trim();
  
  // 3. JSON Array
  if (s.startsWith('[')) {
    try {
      const urls = JSON.parse(s);
      return Array.isArray(urls) ? urls : [];
    } catch { return []; }
  }
  
  // 4. Direct URL or Base64
  if (s.startsWith('http')) return [s];
  if (s.length > 50 && !s.includes(' ')) return [`data:image/jpeg;base64,${s}`];
  
  return [];
}

/**
 * Formats currency in Thai Baht style.
 */
export function formatBaht(amount) {
  return `฿${parseFloat(amount || 0).toLocaleString()}`;
}

/**
 * Normalizes phone numbers (removes non-digits).
 */
export function normPhone(p) {
  if (!p) return "";
  return String(p).trim().replace(/\D/g, '');
}
