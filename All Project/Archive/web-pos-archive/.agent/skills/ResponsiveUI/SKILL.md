---
name: Professional Responsive UI for POS & CRM
description: Guidelines and utility patterns for building space-efficient, professional web interfaces that adapt seamlessly to mobile devices without sacrificing aesthetic quality.
---

# Professional Responsive UI Skill

This skill defines the standard for "Compact & Premium" responsive design in the POS/CRM ecosystem. The goal is to maximize information density on mobile while maintaining the "Wow" factor of the desktop design.

## 📱 Mobile-First Compact Rules

### 1. Unified Sizing System (Tailwind 4)
Instead of fixed high padding, use adaptive padding and font scales:
- **Paddings**: 
  - Desktop: `p-8`, `px-8 py-6`
  - Mobile: `p-4`, `px-4 py-3`
- **Typography**: 
  - Desktop: `text-base` (body), `text-2xl` (headers)
  - Mobile: `text-xs` (body), `text-lg` (headers), `text-[10px]` (labels)
- **Rounded Corners**: 
  - Desktop: `rounded-[40px]` (large containers)
  - Mobile: `rounded-[24px]` (to save inner space)

### 2. High-Density Components

#### A. Card Layouts (instead of Tables)
On screens `< 768px`, table rows should transform into compact vertical cards or high-density rows.
```html
<div class="flex flex-col md:flex-row md:items-center gap-2 md:gap-8 px-4 py-3 md:px-8 md:py-6">
  <!-- Content shifts from stacked to horizontal -->
</div>
```

#### B. Floating & Sticky Actions
- **Desktop**: Sidebar or fixed header.
- **Mobile**: Bottom sheets or floating action bars with `backdrop-blur`.

### 3. Professional Touch Targets
- Maintain a minimum tap area of `44x44px` even if the visual icon is smaller.
- Use `active:scale-95` on all mobile buttons for tactile feedback.

## 🛠️ Implementation Patterns

### Adaptive Table Row
```javascript
<tr className="flex flex-col md:table-row p-4 md:p-0 border-b md:border-none">
  <td className="md:px-8 md:py-6">...</td>
  <!-- Use hidden/block for context-specific data -->
</tr>
```

### Compact Stats Grid
```javascript
<div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
  <!-- 2 columns on mobile, 4 on desktop -->
</div>
```
