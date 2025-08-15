# Wayanad Tree House Resort Website - Design Specifications for Figma

## Design System Foundation

### Color Palette
- **Primary Forest Green**: #2D5016 (Main brand color, navigation, buttons)
- **Earth Brown**: #8B4513 (Secondary elements, text accents)
- **Natural Beige**: #F5F5DC (Background, card backgrounds)
- **Sunset Orange**: #FF8C00 (Call-to-action buttons, highlights)
- **Sky Blue**: #87CEEB (Links, info elements)
- **Leaf Green**: #90EE90 (Success states, nature accents)
- **Pure White**: #FFFFFF (Text, clean backgrounds)
- **Charcoal**: #333333 (Primary text color)

### Typography Scale
- **H1 Headlines**: Montserrat Bold, 32px desktop / 24px mobile
- **H2 Section Headers**: Montserrat SemiBold, 28px desktop / 20px mobile
- **H3 Subsections**: Montserrat Medium, 24px desktop / 18px mobile
- **Body Text**: Open Sans Regular, 16px desktop / 14px mobile
- **Small Text**: Open Sans Regular, 14px desktop / 12px mobile
- **Button Text**: Montserrat Medium, 16px desktop / 14px mobile

### Spacing System
- **Base Unit**: 8px
- **Small**: 16px (2 units)
- **Medium**: 24px (3 units)
- **Large**: 32px (4 units)
- **XL**: 48px (6 units)
- **XXL**: 64px (8 units)

## Page-by-Page Design Specifications

### 1. Home Page Design Prompt

**Overall Layout**: Mobile-first responsive design with full-width sections, organic flowing layouts inspired by forest canopies.

**Hero Section (Above the fold)**:
- **Background**: Full-viewport parallax image of misty Wayanad forest with tree houses visible in the distance
- **Overlay**: Subtle dark gradient (opacity 40%) from top to bottom for text readability
- **Logo**: Top-left corner, wooden texture logo with resort name in Montserrat font, white color
- **Navigation**: Transparent header with hamburger menu (mobile) / horizontal menu (desktop), smooth slide-out animation
- **Main Headline**: Centered, "Experience Nature's Luxury in Wayanad's Tree Houses" in white Montserrat Bold
- **Subheadline**: "Elevated accommodations surrounded by pristine Western Ghats forests" in white Open Sans
- **CTA Buttons**: Two rounded buttons - "Request a Stay" (Sunset Orange) and "Explore Tree Houses" (transparent with white border)
- **Floating Elements**: Subtle animated leaf particles, gentle floating motion
- **Mobile Considerations**: Stack elements vertically, reduce text sizes, ensure touch-friendly button sizes (44px minimum)

**Request a Stay Widget**:
- **Position**: Floating card positioned in bottom-right corner (desktop) / bottom of hero section (mobile)
- **Design**: White rounded card with subtle shadow, forest green accent border
- **Elements**: Check-in/out date pickers with calendar icons, guest selector dropdown, "Request a Stay" button
- **Interactions**: Smooth expand/collapse animation, real-time price display

**Featured Tree Houses Section**:
- **Layout**: Asymmetrical grid with 3 featured accommodations, staggered card heights
- **Card Design**: Rounded corners (16px radius), hover lift effect, image overlay with gradient
- **Content**: High-quality tree house photos, accommodation name, starting price, key amenities icons
- **Typography**: Accommodation names in Montserrat Medium, prices in Sunset Orange
- **Mobile**: Single column stack with full-width cards

**Resort Highlights Section**:
- **Background**: Natural Beige with subtle wood texture pattern
- **Layout**: 4-column grid (desktop) / 2-column grid (mobile) with icon-based features
- **Icons**: Custom hand-drawn nature icons (tree, leaf, mountain, bird) in Forest Green
- **Content**: "Eco-Friendly Construction", "Forest Canopy Views", "Adventure Activities", "Sustainable Tourism"
- **Typography**: Feature titles in Montserrat Medium, descriptions in Open Sans Regular

**Footer**:
- **Background**: Charcoal with forest silhouette pattern
- **Content**: Contact information, social media links, newsletter signup, quick links
- **Design**: Multi-column layout with white text, Sunset Orange accent links

### 2. Accommodations Page Design Prompt

**Page Header**:
- **Background**: Panoramic forest canopy image with tree houses integrated
- **Title**: "Tree House Accommodations" in large Montserrat Bold, white text with shadow
- **Breadcrumb**: Home > Accommodations in small white text

**Filter Section**:
- **Layout**: Horizontal filter bar with dropdown menus and toggle switches
- **Filters**: Price range slider, guest capacity, amenities checkboxes, availability calendar
- **Design**: White background with Forest Green accents, rounded elements
- **Mobile**: Collapsible filter drawer with slide-up animation

**Accommodation Grid**:
- **Layout**: Masonry grid with varying card heights based on content
- **Card Design**: 
  - Image carousel with navigation dots
  - Accommodation name in Montserrat SemiBold
  - Brief description in Open Sans Regular
  - Amenities icons row (WiFi, AC, Balcony, etc.)
  - Price display in Sunset Orange
  - "View Details" button in Forest Green
- **Hover Effects**: Gentle scale transform, shadow increase, button color change
- **Mobile**: Single column with full-width cards

**Individual Accommodation Detail Modal/Page**:
- **Image Gallery**: Full-width carousel with thumbnail navigation, lightbox functionality
- **Information Panel**: 
  - Split layout with images left, details right (desktop)
  - Stacked layout (mobile)
  - Accommodation name, description, amenities list
  - Pricing table with seasonal variations
  - Availability calendar integration
  - Guest reviews section with star ratings
- **Booking Integration**: Sticky booking widget with date selection and instant booking

### 3. Experiences Page Design Prompt

**Hero Section**:
- **Background**: Action shot of guests enjoying forest activities (trekking, zip-lining)
- **Title**: "Forest Adventures & Experiences" with adventure-themed typography
- **Subtitle**: "Discover Wayanad's natural wonders through guided experiences"

**Experience Categories**:
- **Layout**: Hexagonal card grid inspired by honeycomb patterns
- **Categories**: "Nature Walks", "Adventure Sports", "Cultural Experiences", "Wellness Programs"
- **Card Design**: 
  - Background images with color overlays
  - Category icons in white
  - Experience count badges
  - Hover effects with content preview

**Experience Detail Cards**:
- **Layout**: Alternating left-right image-text layout for visual rhythm
- **Content Structure**:
  - High-quality activity photos
  - Experience name and duration
  - Difficulty level indicators (beginner/intermediate/advanced)
  - Detailed descriptions with bullet points
  - Pricing and booking buttons
  - Safety information and requirements
- **Visual Elements**: Custom icons for duration, difficulty, group size
- **Mobile**: Stacked vertical layout with full-width images

### 4. Gallery Page Design Prompt

**Page Structure**:
- **Header**: "Resort Gallery" with filter tabs for categories
- **Categories**: "Tree Houses", "Forest Views", "Activities", "Dining", "Facilities"

**Photo Grid**:
- **Layout**: Pinterest-style masonry grid with varying image sizes
- **Image Treatment**: Rounded corners, subtle hover effects with zoom
- **Lightbox**: Full-screen overlay with navigation arrows, image information
- **Loading**: Lazy loading with skeleton placeholders
- **Mobile**: Responsive grid with optimized image sizes

**Virtual Tour Section**:
- **Design**: Featured section with 360-degree tour previews
- **Interface**: Custom navigation controls with forest-themed design
- **Integration**: Embedded virtual tour viewer with hotspot interactions

### 5. About Page Design Prompt

**Resort Story Section**:
- **Layout**: Storytelling format with alternating text and images
- **Design**: Timeline-style layout showing resort development
- **Images**: Historical photos, construction process, current state
- **Typography**: Large readable text with pull quotes in Sunset Orange

**Team Section**:
- **Layout**: Card-based team member profiles
- **Card Design**: Circular profile photos, names, roles, brief bios
- **Background**: Natural Beige with subtle leaf patterns
- **Interactions**: Hover effects revealing contact information

**Sustainability Section**:
- **Design**: Infographic-style layout with statistics and achievements
- **Visual Elements**: Custom icons for eco-friendly practices
- **Color Scheme**: Emphasis on Leaf Green for environmental messaging

### 6. Contact & Location Page Design Prompt

**Contact Form Section**:
- **Layout**: Split design with form on left, contact information on right
- **Form Design**: 
  - Multi-step form with progress indicator
  - Rounded input fields with Forest Green focus states
  - Dropdown for inquiry types
  - File upload for special requests
  - Submit button with loading animation
- **Validation**: Real-time validation with helpful error messages

**Location Integration**:
- **Map**: Interactive Google Maps with custom forest-themed markers
- **Directions**: Step-by-step directions from major cities
- **Transportation**: Icons and information for different travel options
- **Weather Widget**: Current weather and forecast for trip planning

### 7. Booking Page Design Prompt

**Multi-Step Booking Process**:
- **Step Indicator**: Horizontal progress bar with forest-themed icons
- **Steps**: "Select Dates" → "Choose Room" → "Guest Details" → "Payment" → "Confirmation"

**Step 1 - Date Selection**:
- **Calendar**: Large interactive calendar with availability indicators
- **Design**: Forest Green for available dates, gray for unavailable, Sunset Orange for selected
- **Price Display**: Dynamic pricing updates based on selected dates
- **Mobile**: Compact calendar view with swipe navigation

**Step 2 - Guest Details Form**:
- **Layout**: Clean form design with grouped sections
- **Fields**: Name, email, phone, special requests textarea
- **Design**: Rounded input fields with Forest Green focus states
- **Validation**: Real-time validation with inline error messages

**Confirmation Page**:
- **Design**: Success state with checkmark icon and booking reference
- **Content**: Booking summary, contact information, next steps
- **Actions**: Print booking, add to calendar, share options

## Admin Dashboard Design Specifications

### 8. Admin Analytics Dashboard Design Prompt

**Dashboard Layout**:
- **Sidebar Navigation**: Dark Forest Green sidebar with white icons and text
- **Main Content**: Light background with card-based widget layout
- **Header**: Admin user profile, notifications, quick actions
- **Responsive**: Collapsible sidebar for mobile, stacked widgets

**Key Performance Indicators (KPI) Section**:
- **Layout**: 4-column grid of metric cards (desktop) / 2-column (tablet) / 1-column (mobile)
- **Card Design**: 
  - White background with subtle shadow
  - Colored accent border (Forest Green, Sunset Orange, Sky Blue, Leaf Green)
  - Large metric number in Montserrat Bold
  - Metric label in Open Sans Regular
  - Percentage change indicator with up/down arrows
  - Sparkline charts for trend visualization
- **Metrics**: Total Visitors, Booking Enquiries, Conversion Rate, Average Session Duration
- **Interactions**: Hover effects with detailed tooltips, click to drill down

**Real-Time Visitor Map**:
- **Design**: Interactive world map with visitor location dots
- **Color Coding**: Different colors for visitor sources (organic, direct, social, referral)
- **Animation**: Gentle pulsing dots for active visitors
- **Info Panel**: Live visitor count, top countries, current active pages
- **Mobile**: Simplified list view with country flags and visitor counts

**Traffic Analytics Charts**:
- **Layout**: Grid of chart widgets with consistent styling
- **Chart Types**: Line charts for traffic trends, bar charts for page comparisons, pie charts for device breakdown
- **Design**: 
  - Forest Green primary color for data visualization
  - Clean grid lines and axis labels
  - Interactive tooltips on hover
  - Date range selector with preset options (7 days, 30 days, 3 months)
- **Charts Include**: 
  - Page Views Over Time
  - Top Performing Pages
  - Device & Browser Analytics
  - Traffic Sources Breakdown
  - User Journey Flow

**Conversion Funnel Visualization**:
- **Design**: Horizontal funnel chart showing booking journey stages
- **Stages**: Homepage Visit → Accommodation View → Booking Form → Enquiry Submitted
- **Visual**: Decreasing width bars with conversion percentages
- **Colors**: Gradient from Forest Green to Sunset Orange
- **Interactions**: Click on stage to see detailed breakdown

**Customer Insights Dashboard**:
- **Layout**: Mixed widget layout with demographics and behavior data
- **Widgets**:
  - Age Group Distribution (donut chart)
  - Popular Accommodations (horizontal bar chart)
  - Seasonal Booking Trends (line chart with seasonal markers)
  - Average Booking Value (metric card with trend)
  - Customer Satisfaction Scores (gauge chart)
- **Design**: Consistent card styling with nature-inspired data visualization colors

### 9. SEO Management Panel Design Prompt (Phase 2)

**SEO Dashboard Overview**:
- **Layout**: Tab-based interface with "Technical SEO", "Content Optimization", "Local SEO", "Performance"
- **Header**: SEO score gauge (0-100) with color coding (red, yellow, green)
- **Quick Actions**: "Generate Sitemap", "Update Meta Tags", "Check Rankings"

**Technical SEO Tab**:
- **Core Web Vitals Section**:
  - **Design**: Three gauge charts for LCP, INP, CLS scores
  - **Color Coding**: Green (good), Yellow (needs improvement), Red (poor)
  - **Details**: Expandable sections with improvement recommendations
- **Site Health Checklist**:
  - **Layout**: Checklist format with green checkmarks and red X marks
  - **Items**: SSL Certificate, Mobile Friendliness, Page Speed, Sitemap Status
  - **Actions**: Quick fix buttons for common issues

**Content Optimization Tab**:
- **Keyword Tracking Table**:
  - **Design**: Sortable data table with search functionality
  - **Columns**: Keyword, Current Position, Change, Search Volume, Difficulty
  - **Visual Indicators**: Up/down arrows for ranking changes, color-coded difficulty levels
- **Content Scoring Cards**:
  - **Layout**: Grid of page cards with SEO scores
  - **Card Design**: Page title, current score (0-100), top improvement suggestions
  - **Actions**: "Optimize" button leading to detailed recommendations

**Local SEO Tab**:
- **Google My Business Integration**:
  - **Design**: Dashboard widget showing GMB status and recent reviews
  - **Elements**: Star rating display, recent review cards, post scheduling interface
- **Local Citations Management**:
  - **Layout**: Table format showing citation sources and consistency status
  - **Status Indicators**: Green (consistent), Yellow (needs update), Red (missing)

**Performance Monitoring Tab**:
- **Ranking Trends Chart**:
  - **Design**: Multi-line chart showing keyword position changes over time
  - **Interactions**: Hover tooltips, keyword filtering, date range selection
- **Organic Traffic Analytics**:
  - **Layout**: Combined chart and metrics layout
  - **Metrics**: Organic sessions, click-through rates, average position
  - **Comparison**: Month-over-month and year-over-year comparisons

### 10. Admin Booking Management Design Prompt

**Enquiry Management Interface**:
- **Layout**: Master-detail layout with enquiry list on left, details on right
- **List Design**: 
  - Compact cards with customer name, accommodation, dates, status
  - Color-coded status indicators (New: Sunset Orange, Contacted: Sky Blue, Confirmed: Leaf Green)
  - Quick action buttons (Call, Email, Update Status)
- **Detail Panel**: 
  - Customer information section
  - Booking details with calendar integration
  - Communication history timeline
  - Notes section with rich text editor
  - Status update dropdown with confirmation

**Analytics Export Interface**:
- **Design**: Modal dialog with export options
- **Filters**: Date range picker, status multiselect, accommodation filter
- **Format Options**: Excel, CSV, PDF with preview thumbnails
- **Progress**: Loading animation during export generation
- **Download**: Direct download link with file size information

**Communication Tools**:
- **Call Integration**: Click-to-call buttons with call logging
- **Email Templates**: Pre-designed email templates for different scenarios
- **SMS Integration**: Quick SMS sending with template messages
- **Notes System**: Threaded notes with timestamps and admin attribution

## Mobile-First Design Considerations

### Responsive Breakpoints
- **Mobile**: 320px - 767px (single column layouts, stacked elements)
- **Tablet**: 768px - 1023px (two-column layouts, condensed navigation)
- **Desktop**: 1024px+ (full multi-column layouts, hover interactions)

### Touch Optimization
- **Button Sizes**: Minimum 44px height for touch targets
- **Spacing**: Increased padding between interactive elements
- **Gestures**: Swipe navigation for galleries, pull-to-refresh for data
- **Forms**: Large input fields, dropdown alternatives for mobile

### Performance Optimization
- **Images**: WebP format with fallbacks, lazy loading, responsive sizing
- **Fonts**: Optimized font loading with display: swap
- **Animations**: Reduced motion preferences, hardware acceleration
- **Critical CSS**: Above-the-fold styling prioritization

## Accessibility Guidelines

### Color Contrast
- **Text**: Minimum 4.5:1 contrast ratio for normal text, 3:1 for large text
- **Interactive Elements**: Clear focus indicators with 3:1 contrast
- **Status Indicators**: Not relying solely on color for information

### Navigation
- **Keyboard Navigation**: Tab order, skip links, focus management
- **Screen Readers**: Semantic HTML, ARIA labels, descriptive link text
- **Alternative Text**: Descriptive alt text for all images and icons

### Interactive Elements
- **Form Labels**: Clear association between labels and inputs
- **Error Messages**: Descriptive error messages with correction guidance
- **Loading States**: Clear indication of loading and completion states
- **Price Display**: Dynamic pricing based on selected dates

**Step 2 - Room Selection**:
- **Layout**: Horizontal scrolling cards with room options
- **Card Content**: Room images, names, amenities, pricing comparison
- **Selection**: Radio button selection with visual feedback

**Step 3 - Guest Information**:
- **Form Layout**: Clean form design with grouped sections
- **Fields**: Personal information, special requests, dietary requirements
- **Design**: Consistent with contact form styling

**Step 4 - Payment**:
- **Security**: SSL indicators and security badges
- **Payment Options**: Credit card, UPI, net banking with respective icons
- **Summary**: Booking summary sidebar with total calculation

**Confirmation Page**:
- **Design**: Success-themed layout with confirmation details
- **Actions**: Download receipt, add to calendar, share booking
- **Follow-up**: Information about check-in process and contact details

### 8. Admin Dashboard Design Prompt

**Dashboard Layout**:
- **Sidebar Navigation**: Collapsible sidebar with admin menu items
- **Main Content**: Grid-based dashboard with analytics widgets
- **Color Scheme**: Professional adaptation of brand colors with more neutral tones

**Analytics Widgets**:
- **Booking Statistics**: Charts showing occupancy rates, revenue trends
- **Guest Demographics**: Visual representations of guest data
- **Popular Accommodations**: Performance metrics for different tree houses
- **Design**: Card-based widgets with data visualizations

**Content Management Interface**:
- **WYSIWYG Editor**: Rich text editor for page content updates
- **Image Management**: Drag-and-drop image upload with preview
- **Form Builder**: Interface for creating and managing contact forms
- **Preview Mode**: Live preview of changes before publishing

**Booking Management**:
- **Calendar View**: Monthly calendar showing all bookings
- **List View**: Detailed booking information in table format
- **Guest Profiles**: Individual guest information and booking history
- **Communication Tools**: Email templates and messaging system

## Responsive Design Guidelines

### Mobile Breakpoints
- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px and above

### Mobile-Specific Considerations
- **Touch Targets**: Minimum 44px for all interactive elements
- **Navigation**: Hamburger menu with slide-out drawer
- **Images**: Optimized sizes with lazy loading
- **Forms**: Single-column layouts with large input fields
- **Cards**: Full-width with adequate spacing
- **Typography**: Increased line height for better readability

### Animation and Interactions
- **Page Transitions**: Smooth fade-in effects for page loads
- **Hover States**: Subtle scale and shadow changes
- **Loading States**: Skeleton screens and progress indicators
- **Micro-interactions**: Button press feedback, form validation animations
- **Parallax Effects**: Subtle parallax scrolling for hero sections (desktop only)

This comprehensive design specification provides detailed guidance for creating a cohesive, nature-inspired design system that reflects the unique character of a Wayanad tree house resort while ensuring optimal user experience across all devices and use cases.