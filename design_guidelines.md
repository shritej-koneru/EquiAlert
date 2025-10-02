# EQUIALERT - Stock Market Application Design Guidelines

## Design Approach
**Reference-Based**: Financial dashboard applications (Robinhood, Bloomberg Terminal, Zerodha) with emphasis on real-time data visualization and professional dark-mode aesthetics.

## Core Design Principles
- **Data-First Design**: Information hierarchy prioritizes real-time stock data and market movements
- **Dark Mode Professionalism**: Deep, true dark backgrounds that reduce eye strain during extended trading sessions
- **Color-Coded Intelligence**: Instant visual feedback through green/red indicators for market movements
- **Smooth Micro-interactions**: Subtle animations that guide user attention without distraction

---

## Color Palette

### Dark Mode Foundation
- **Background Primary**: 12 8% 8% (Deep charcoal, true dark)
- **Background Secondary**: 12 8% 12% (Elevated surfaces, cards)
- **Background Tertiary**: 12 8% 16% (Highest elevation, modals)

### Market Indicators
- **Positive/Bullish**: 145 100% 50% (#00FF7F - Bright spring green)
- **Negative/Bearish**: 0 100% 64% (#FF4C4C - Vibrant red)
- **Neutral/Unchanged**: 0 0% 60% (Medium gray)

### UI Accents
- **Primary Brand**: 210 100% 50% (Professional blue for EQUIALERT branding)
- **Text Primary**: 0 0% 98% (Near white for primary text)
- **Text Secondary**: 0 0% 70% (Gray for secondary information)
- **Text Muted**: 0 0% 45% (Subtle gray for timestamps, metadata)

### Interactive States
- **Link/CTA**: 210 100% 60% (Bright blue for actionable items)
- **Warning/Alert**: 38 100% 50% (Amber for important notifications)
- **Border/Divider**: 0 0% 20% (Subtle separation)

---

## Typography

### Font Families
- **Primary**: 'SF Pro Display', -apple-system, system-ui (Apple platforms)
- **Secondary**: 'Roboto', sans-serif (Android/Web)
- **Monospace**: 'SF Mono', 'Roboto Mono' (Stock tickers, prices)

### Type Scale
- **Brand Logo**: text-2xl font-bold (EQUIALERT)
- **Stock Prices**: text-3xl font-semibold (monospace)
- **Headlines**: text-xl font-semibold
- **Body**: text-base font-normal
- **Metadata**: text-sm font-normal
- **Captions**: text-xs font-normal

---

## Layout System

### Spacing Primitives
Use Tailwind units: **2, 4, 6, 8, 12, 16, 20, 24** for consistent rhythm
- Tight spacing: p-2, gap-2 (within components)
- Standard spacing: p-4, gap-4 (component padding)
- Generous spacing: p-6, gap-6 (section separation)
- Large spacing: p-8, p-12 (page margins)

### Grid System
- **Mobile**: Single column, full-width components
- **Tablet**: 2-column layouts for watchlist/news
- **Desktop**: 3-column max for stock cards, flexible for charts

---

## Component Library

### Navigation Components

**Top Bar** (fixed, h-16)
- Left: EQUIALERT logo with brand blue
- Right: Notification bell (with unread badge) + Profile icon
- Background: bg-secondary with subtle border-b
- Icons: 24px, text-secondary with hover:text-primary

**Bottom Navigation Bar** (fixed, h-16)
- Three tabs: Home, News, Stocks
- Active state: Icon + text in primary blue with subtle top border
- Inactive state: Icons in text-secondary
- Position: bottom-0, full-width

**Sliding Stock Ticker** (horizontal scroll)
- Height: h-20
- Each ticker item: rounded card with p-3
- Display: Stock logo/symbol, current price (monospace), % change (color-coded)
- Scroll behavior: Smooth horizontal scroll, snap-x
- Tap interaction: Expands to full chart view

### Data Display Components

**Watchlist Cards**
- Container: rounded-lg, bg-secondary, p-4
- Layout: Grid with stock name, ticker, mini chart, price, % change
- Alert icon: Top-right corner when significant movement detected
- Swipe gestures: Left (remove), Right (set alert)
- Mini chart: 80px height, simplified line chart in green/red

**Stock Chart Views**
- Full-screen modal when stock selected
- Time range tabs: 1D, 1W, 1M, 1Y, 5Y (horizontal scroll)
- Active tab: Underline in primary blue
- Chart area: 60% of viewport height
- Color coding: Green line for uptrend, red for downtrend
- Grid lines: Subtle gray (opacity 0.1)
- Data points: Show on touch/hover

**News Cards**
- Image thumbnail: 100px × 100px, rounded-lg, left-aligned
- Headline: text-base font-semibold, 2-line clamp
- Metadata: Source + timestamp in text-sm text-muted
- Spacing: gap-3 between cards
- Filters: Pill-shaped chips with active state in primary blue

### Interactive Components

**Floating Chatbot Icon**
- Position: bottom-right (bottom-20, right-6)
- Size: w-14 h-14, rounded-full
- Background: gradient from primary to lighter blue
- Icon: 28px message/bot icon
- Shadow: Large drop shadow for elevation
- Animation: Subtle pulse on new alerts

**Chatbot Panel**
- Slides up from bottom: h-3/4 viewport
- Rounded top corners: rounded-t-3xl
- Background: bg-tertiary
- Message bubbles: Rounded-2xl, bot messages in bg-secondary, user in primary blue
- News snippets: Embedded cards with source, timestamp

**Alert Notifications**
- Toast style: Top-right corner
- Background: bg-secondary with border-l-4 (green/red based on alert type)
- Duration: 5 seconds auto-dismiss
- Content: Stock symbol, price change, % change

**Profile Settings Modal**
- Full-screen overlay with backdrop blur
- Form fields: Name, Profession, WhatsApp number
- Input styling: bg-secondary, border border-divider, focus:border-primary
- Save button: Full-width, primary blue, rounded-lg

### Stock Search & Selection

**Search Bar**
- Full-width with rounded-xl background
- Icon: Left-aligned magnifying glass
- Placeholder: "Search stocks..." in text-muted
- Results dropdown: bg-secondary, max-h-80, scroll

**Stock Selection Modal**
- Display selected stocks as chips with X to remove
- Suggested stocks: Scrollable horizontal list
- Each suggestion: Logo + name + ticker in rounded card

---

## Animations & Transitions

### Micro-interactions
- **Button press**: Scale 0.98, duration-100
- **Card hover**: Subtle lift with shadow, duration-200
- **Price updates**: Flash animation (green/red) on change, duration-500
- **Chart rendering**: Smooth draw-in animation, duration-800
- **Modal enter/exit**: Slide up/down with fade, duration-300

### Loading States
- **Skeleton screens**: Animated gradient shimmer on bg-secondary
- **Chart loading**: Progressive line drawing
- **Ticker loading**: Horizontal shimmer wave

---

## Real-Time Data Visualization

### Chart Specifications
- **1D View**: 1-minute intervals, full trading day (9:15 AM - 3:30 PM IST)
- **1W View**: Hourly intervals, 5 trading days
- **1M View**: Daily intervals, ~22 trading days
- **1Y View**: Weekly intervals, 52 weeks
- **5Y View**: Monthly intervals, 60 months

### Market Status Indicator
- **Open**: Green dot + "Market Open" + current IST time
- **Closed**: Red dot + "Market Closed" + next open time
- Position: Below stock ticker, text-sm
- Update: Real-time based on IST trading hours (9:15 AM - 3:30 PM)

---

## Images & Media

### Stock Logos
- Size: 40px × 40px circular
- Fallback: First letter of stock symbol in colored circle
- Format: PNG with transparent background

### News Thumbnails
- Aspect ratio: 16:9 or 1:1
- Size: 100px × 100px for list view
- Loading: Low-quality placeholder → full image

### No Hero Image
This application is utility-focused with emphasis on data density and real-time information. No traditional hero section is used.

---

## Responsive Breakpoints

- **Mobile**: < 768px (single column, bottom nav visible)
- **Tablet**: 768px - 1024px (2-column layouts)
- **Desktop**: > 1024px (3-column max, expanded charts)