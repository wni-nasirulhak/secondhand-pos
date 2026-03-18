/**
 * Senior-level Project Constants
 */

export const BRANDS = [
  'Uniqlo', 'Zara', 'H&M', 'Adidas', 'Nike', "Levi's", 'Gap', 
  'Polo Ralph Lauren', 'Muji', 'Champion', 'Carhartt', 'Dickies', 
  'Columbia', 'The North Face', 'Vintage', 'Thrift', 'Other'
];

export const CONDITIONS = [
  { label: '⭐⭐⭐⭐⭐ New w/Tag (10/10)', value: '10/10 New' },
  { label: '⭐⭐⭐⭐✨ Like New (9.5/10)', value: '9.5/10 Like New' },
  { label: '⭐⭐⭐⭐ Good (9/10)', value: '9/10 Good' },
  { label: '⭐⭐⭐ Used Good (8/10)', value: '8/10 Used Good' },
  { label: '⭐⭐ Vintage (7/10)', value: '7/10 Vintage' },
];

export const SIZES_CLOTHING = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size'];

export const SHOE_SIZES_EU = Array.from({ length: 13 }, (_, i) => String(35 + i));

export const PATTERNS = [
  'เรียบ (Solid)', 'ลายทาง (Stripe)', 'ลายตาราง (Plaid)', 'ลายดอกไม้ (Floral)', 
  'ลายกราฟิก (Graphic)', 'พิมพ์ลาย (Print)', 'ลายไทย', 'อื่นๆ'
];

export const MATERIALS = [
  'Cotton 100%', 'Polyester', 'Cotton/Polyester Mix', 'Denim', 
  'Linen', 'Wool', 'Nylon', 'Fleece', 'Velvet', 'Corduroy', 'อื่นๆ'
];

export const COLORS = [
  'ขาว', 'ดำ', 'เทา', 'น้ำเงิน', 'แดง', 'เขียว', 'เหลือง', 'ส้ม', 'ชมพู', 'ม่วง', 'น้ำตาล', 'เบจ', 'กรมท่า', 'หลายสี'
];

export const PRODUCT_TYPES = [
  { id: 'เสื้อ', label: 'เสื้อ', icon: '👕', code: 'SHIRT', measureType: 'top', dbCategory: 'Clothing' },
  { id: 'กางเกง', label: 'กางเกง', icon: '👖', code: 'PANT', measureType: 'bottom', dbCategory: 'Clothing' },
  { id: 'รองเท้า', label: 'รองเท้า', icon: '👟', code: 'SHOE', measureType: 'shoe', dbCategory: 'Shoes' },
  { id: 'เสื้อกันหนาว', label: 'เสื้อกันหนาว', icon: '🧥', code: 'JACK', measureType: 'top', dbCategory: 'Clothing' },
  { id: 'กระโปรง', label: 'กระโปรง', icon: '👗', code: 'SKIRT', measureType: 'bottom', dbCategory: 'Clothing' },
  { id: 'อุปกรณ์เสริม', label: 'อุปกรณ์', icon: '🎒', code: 'ACC', measureType: 'none', dbCategory: 'Accessories' },
];
