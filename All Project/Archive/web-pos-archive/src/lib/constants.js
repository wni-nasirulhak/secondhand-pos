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

export const STATUSES = [
  { label: 'พร้อมขาย (Available)', value: 'Available' },
  { label: 'รอพิมพ์ (Pending)', value: 'Pending Print' },
  { label: 'ขายแล้ว (Sold)', value: 'Sold' },
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
  { id: 'ชุดเดรส', label: 'ชุดเดรส', icon: '👗', code: 'DRESS', measureType: 'top', dbCategory: 'Clothing' },
  { id: 'หมวก', label: 'หมวก', icon: '🧢', code: 'HAT', measureType: 'none', dbCategory: 'Accessories' },
  { id: 'กระเป๋า', label: 'กระเป๋า', icon: '👜', code: 'BAG', measureType: 'none', dbCategory: 'Accessories' },
  { id: 'เข็มขัด', label: 'เข็มขัด', icon: '🏷️', code: 'BELT', measureType: 'none', dbCategory: 'Accessories' },
  { id: 'แว่นตา', label: 'แว่นตา', icon: '👓', code: 'GLASS', measureType: 'none', dbCategory: 'Accessories' },
  { id: 'นาฬิกา', label: 'นาฬิกา', icon: '⌚', code: 'WATCH', measureType: 'none', dbCategory: 'Accessories' },
  { id: 'เครื่องประดับ', label: 'เครื่องประดับ', icon: '💍', code: 'JEWEL', measureType: 'none', dbCategory: 'Accessories' },
  { id: 'ถุงเท้า', label: 'ถุงเท้า', icon: '🧦', code: 'SOCK', measureType: 'none', dbCategory: 'Clothing' },
  { id: 'อุปกรณ์ไอที', label: 'ไอที/แกดเจ็ต', icon: '💻', code: 'TECH', measureType: 'none', dbCategory: 'Electronics' },
  { id: 'ของเล่น', label: 'ของเล่น', icon: '🧸', code: 'TOY', measureType: 'none', dbCategory: 'Toys' },
  { id: 'ฟิกเกอร์', label: 'โมเดล/ฟิกเกอร์', icon: '🤖', code: 'FIG', measureType: 'none', dbCategory: 'Toys' },
  { id: 'ของใช้ในบ้าน', label: 'ของใช้ในบ้าน', icon: '🏠', code: 'HOME', measureType: 'none', dbCategory: 'Home' },
  { id: 'ของสะสม', label: 'ของสะสม', icon: '💎', code: 'COLL', measureType: 'none', dbCategory: 'Vintage' },
  { id: 'อุปกรณ์เสริมอื่นๆ', label: 'อุปกรณ์อื่นๆ', icon: '🎒', code: 'ACC', measureType: 'none', dbCategory: 'Accessories' },
];
