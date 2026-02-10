# Task: Responsive Overhaul (Mobile-First)

Implement a fully responsive experience for Zaeom Market, ensuring the marketplace and admin panel feel native on mobile devices.

## 🛠 Tech Stack
- React + Tailwind CSS
- Framer Motion (Animations)
- Lucide React (Icons)

## 📋 Phases

### Phase 1: Dashboard Architecture (`DashboardLayout.tsx`)
- [ ] Add **Bottom Navigation Bar** for mobile (Home, Categories/Search, Admin, Profile).
- [ ] Hide Sidebar on screens `< md`.
- [ ] Adjust Header (Search bar) for mobile spacing.
- [ ] Implement safe area insets for mobile browsers.

### Phase 2: Marketplace UX (`Home.tsx` & Components)
- [ ] **Hero Section:** Create a compact mobile version with reduced typography and padding.
- [ ] **Product Grid:** Adjust from 1 column (mobile) to 2 (tablet) to 3+ (desktop).
- [ ] **Product Cards:** Ensure touch targets are appropriate and font sizes scale.
- [ ] **Product Modal:** Make it full-screen or "Bottom Sheet" style on mobile.

### Phase 3: Admin Excellence (`Admin.tsx`)
- [ ] **Navigation:** Responsive tabs (scrollable on mobile).
- [ ] **Tables:** Implement `overflow-x-auto` with styled scrollbars and sticky "Actions" column if needed.
- [ ] **Forms/Modals:** Ensure all admin modals and forms use full width on mobile.
- [ ] **Bulk Actions:** Adjust the floating bar for mobile view.

### Phase 4: Interactions & Polish
- [ ] Add swipe-to-close for modais (Framer Motion `drag`).
- [ ] Implement active state feedback for touch.
- [ ] Final visual audit for spacing (padding/margins) across all breakpoints.

## 🧪 Verification
- [ ] Test on Chrome DevTools (iPhone SE to iPad Pro).
- [ ] Verify horizontal scroll on Admin tables.
- [ ] Ensure Bottom Nav is sticky and functional.
