# Detailed Page Prompts for Wayanad Tree House Resort Website

## Main Pages Prompts

### 1. Home Page Prompt

**Component Structure:**
- Hero Section with parallax forest background
- Navigation header with mobile hamburger menu
- Featured tree houses carousel
- Resort highlights grid
- Request a stay widget (floating)
- Footer with contact information

**Detailed Design Specifications:**

**Hero Section:**
- Full viewport height (100vh) with parallax scrolling effect
- Background: High-resolution Wayanad forest image with morning mist
- Overlay: Dark gradient (rgba(0,0,0,0.4)) for text readability
- Main headline: "Experience Nature's Luxury in Wayanad's Tree Houses" (Montserrat Bold, 48px desktop/32px mobile, white)
- Subheadline: "Elevated accommodations surrounded by pristine Western Ghats forests" (Open Sans Regular, 20px desktop/16px mobile, white)
- Two CTA buttons: "Request a Stay" (Sunset Orange #FF8C00, rounded 8px) and "Explore Tree Houses" (transparent with white border)
- Animated floating leaf particles using CSS animations
- Mobile: Stack elements vertically, reduce font sizes, ensure 44px minimum touch targets

**Navigation Header:**
- Transparent background with backdrop-blur effect on scroll
- Logo: Wooden texture with resort name (Montserrat Medium, white)
- Desktop: Horizontal menu with smooth hover animations
- Mobile: Hamburger menu (3 lines) with slide-out drawer animation
- Menu items: Home, Accommodations, Experiences, Gallery, About, Contact
- Sticky positioning with smooth show/hide on scroll

**Featured Tree Houses Section:**
- Section background: Natural Beige (#F5F5DC) with subtle wood texture
- Title: "Our Signature Tree Houses" (Montserrat SemiBold, 36px desktop/24px mobile, Forest Green)
- Layout: Asymmetrical grid with 3 cards, staggered heights
- Card design: Rounded corners (16px), hover lift effect (translateY(-8px)), shadow increase
- Image: High-quality tree house photos with aspect ratio 4:3
- Content: Tree house name, starting price (Sunset Orange), 3 key amenities with icons
- CTA: "View Details" button (Forest Green, rounded)
- Mobile: Single column, full-width cards with 16px margin

**Resort Highlights Grid:**
- 4-column grid (desktop) / 2-column (mobile)
- Icons: Custom hand-drawn nature icons (64px, Forest Green)
- Features: "Eco-Friendly Construction", "Forest Canopy Views", "Adventure Activities", "Sustainable Tourism"
- Typography: Feature titles (Montserrat Medium, 18px), descriptions (Open Sans Regular, 14px)
- Hover effects: Icon scale animation, background color change

**Request a Stay Widget:**
- Floating position: Bottom-right corner (desktop) / Bottom of hero (mobile)
- Design: White rounded card (16px radius) with Forest Green accent border
- Elements: Check-in/out date pickers, guest selector dropdown, "Request a Stay" button
- Interactions: Expand/collapse animation, enquiry form submission
- Form validation: Required field indicators, error messages

**Footer:**
- Background: Charcoal (#333333) with forest silhouette pattern
- Layout: 4-column grid with contact info, quick links, social media, newsletter
- Typography: White text with Sunset Orange accent links
- Social icons: Custom nature-themed social media icons
- Newsletter signup: Email input with "Subscribe" button

### 2. Accommodations Page Prompt

**Component Structure:**
- Page header with breadcrumb navigation
- Filter sidebar with search and sorting options
- Accommodation grid with card-based layout
- Pagination component
- Individual accommodation modal/detail view

**Detailed Design Specifications:**

**Page Header:**
- Background: Panoramic forest canopy image (height: 300px desktop/200px mobile)
- Title: "Tree House Accommodations" (Montserrat Bold, 48px desktop/32px mobile, white with text shadow)
- Breadcrumb: "Home > Accommodations" (Open Sans Regular, 14px, white with opacity 0.8)
- Overlay: Dark gradient for text readability

**Filter Sidebar:**
- Width: 300px (desktop) / Full width collapsible drawer (mobile)
- Background: White with subtle shadow
- Sections: Price range slider, guest capacity, amenities checkboxes, availability calendar
- Price slider: Custom styled with Forest Green track and Sunset Orange handle
- Amenities: Checkbox list with custom icons (WiFi, AC, Balcony, Forest View, etc.)
- Apply/Clear buttons: Forest Green primary, light gray secondary
- Mobile: Slide-up drawer with backdrop overlay

**Accommodation Grid:**
- Layout: Masonry grid with 3 columns (desktop) / 1 column (mobile)
- Card spacing: 24px gap between cards
- Card design: White background, rounded corners (12px), hover shadow increase
- Image carousel: Multiple images with navigation dots, aspect ratio 16:9
- Content structure:
  - Accommodation name (Montserrat SemiBold, 20px, Forest Green)
  - Brief description (Open Sans Regular, 14px, 2 lines max with ellipsis)
  - Amenities row: Icon grid with tooltips on hover
  - Price display: "Starting from ₹X,XXX/night" (Sunset Orange, Montserrat Medium)
  - "View Details" button (Forest Green, full width)
- Hover effects: Card lift (translateY(-4px)), image zoom (scale(1.05))

**Accommodation Detail Modal:**
- Full-screen overlay with backdrop blur
- Modal content: Max-width 1200px, centered
- Close button: Top-right corner with hover animation
- Layout: Split design - Image gallery left (60%) / Details right (40%)
- Image gallery: Main image with thumbnail navigation, lightbox functionality
- Details panel:
  - Accommodation name and rating stars
  - Detailed description with expandable "Read More"
  - Amenities grid with icons and labels
  - Pricing table with seasonal variations
  - Availability calendar integration
  - Guest reviews section with pagination
  - Sticky booking widget at bottom
- Mobile: Stacked layout with swipeable image gallery

### 3. Experiences Page Prompt

**Component Structure:**
- Hero section with activity montage
- Experience categories navigation
- Experience cards grid
- Individual experience detail sections
- Booking integration for activities

**Detailed Design Specifications:**

**Hero Section:**
- Background: Action montage of guests enjoying forest activities
- Height: 400px desktop / 250px mobile
- Title: "Forest Adventures & Experiences" (Montserrat Bold, 44px desktop/28px mobile)
- Subtitle: "Discover Wayanad's natural wonders through guided experiences"
- CTA: "Explore All Activities" button

**Experience Categories:**
- Layout: Horizontal scrolling tabs (mobile) / Fixed navigation (desktop)
- Categories: "Nature Walks", "Adventure Sports", "Cultural Experiences", "Wellness Programs"
- Design: Pill-shaped tabs with active state highlighting
- Active state: Forest Green background, white text
- Inactive state: Transparent background, Forest Green text

**Experience Cards Grid:**
- Layout: Hexagonal card arrangement inspired by honeycomb patterns
- Card design: Rectangular shape with rounded corners (12px) and background images with color overlays
- Hover effects: Scale animation, overlay opacity change, clear focus rings for keyboard navigation
- Content: Experience name, duration, difficulty level, starting price
- Icons: Custom activity icons (hiking, zip-lining, bird watching, etc.) with proper alt text
- Mobile: Single column layout with full-width cards

**Experience Detail Sections:**
- Layout: Alternating left-right image-text layout for visual rhythm
- Image: High-quality activity photos (aspect ratio 3:2)
- Content structure:
  - Experience name and category badge
  - Duration and difficulty indicators with custom icons
  - Detailed description with bullet points
  - What's included/excluded lists
  - Safety information and requirements
  - Pricing and group size information
  - "Book This Experience" CTA button
- Mobile: Stacked vertical layout with full-width images

### 4. Gallery Page Prompt

**Component Structure:**
- Gallery header with category filters
- Masonry photo grid with lazy loading
- Lightbox modal for full-size viewing
- Virtual tour integration section
- Social sharing functionality

**Detailed Design Specifications:**

**Gallery Header:**
- Title: "Resort Gallery" (Montserrat Bold, 40px desktop/28px mobile)
- Filter tabs: "All", "Tree Houses", "Forest Views", "Activities", "Dining", "Facilities"
- Tab design: Underlined active state with smooth transition animation
- Search functionality: Search input with magnifying glass icon

**Photo Grid:**
- Layout: Pinterest-style masonry grid with varying image heights
- Columns: 4 columns (desktop) / 2 columns (tablet) / 1 column (mobile)
- Image treatment: Rounded corners (8px), subtle hover zoom effect
- Lazy loading: Skeleton placeholders with shimmer animation
- Image overlay: Gradient overlay on hover with view icon
- Infinite scroll: Load more images as user scrolls

**Lightbox Modal:**
- Full-screen overlay with dark background
- Navigation: Left/right arrows, close button, thumbnail strip
- Image information: Title, description, category tags
- Social sharing: Facebook, Instagram, WhatsApp share buttons
- Keyboard navigation: Arrow keys, escape key support
- Mobile: Swipe gestures for navigation

**Virtual Tour Section:**
- Featured section with 360-degree tour previews
- Tour categories: "Tree House Interior", "Forest Canopy Walk", "Resort Grounds"
- Custom navigation controls with forest-themed design
- Hotspot interactions: Clickable information points
- Full-screen tour option with immersive controls

### 5. About Page Prompt

**Component Structure:**
- Resort story timeline section
- Mission and values grid
- Team member profiles
- Sustainability initiatives showcase
- Awards and certifications display

**Detailed Design Specifications:**

**Resort Story Timeline:**
- Layout: Vertical timeline with alternating content sides
- Timeline line: Forest Green with milestone markers
- Content blocks: Image + text pairs with year indicators
- Images: Historical photos, construction process, current state
- Typography: Timeline years (Montserrat Bold, 24px), story text (Open Sans Regular, 16px)
- Animation: Scroll-triggered fade-in effects for timeline items

**Mission and Values Grid:**
- Layout: 3-column grid with icon-based value propositions
- Icons: Custom illustrations representing sustainability, luxury, nature
- Content: Value title, description, supporting statistics
- Background: Natural Beige with subtle texture pattern
- Hover effects: Icon animation, background color shift

**Team Profiles:**
- Layout: Card-based grid with team member information
- Card design: Circular profile photos, names, roles, brief bios
- Hover effects: Card flip animation revealing contact information
- Social links: LinkedIn, email contact options
- Mobile: Single column with expanded card content

**Sustainability Section:**
- Infographic-style layout with environmental statistics
- Visual elements: Custom icons for eco-friendly practices
- Color emphasis: Leaf Green for environmental messaging
- Interactive elements: Hover tooltips with detailed information
- Certifications: Logo display of environmental certifications

### 6. Contact & Location Page Prompt

**Component Structure:**
- Contact information header
- Multi-step contact form
- Interactive location map
- Directions and transportation info
- Emergency contact details

**Detailed Design Specifications:**

**Contact Header:**
- Background: Wayanad landscape with resort location marker
- Contact cards: Phone, email, address with respective icons
- Operating hours: Clear display of availability times
- Emergency contact: Highlighted section for urgent inquiries

**Contact Form:**
- Layout: Split design with form left, contact info right
- Multi-step form: "Inquiry Type" → "Details" → "Message" → "Confirmation"
- Form fields: Name, email, phone, inquiry type dropdown, message textarea
- File upload: Drag-and-drop area for attachments
- Validation: Real-time validation with helpful error messages
- Submit button: Loading animation during form submission

**Location Map:**
- Interactive Google Maps integration with custom forest-themed markers
- Resort location: Custom tree house icon marker
- Nearby attractions: Points of interest with information popups
- Directions: Integrated directions from user's location
- Transportation options: Icons and information for car, bus, train access

**Weather Widget:**
- Current weather display for trip planning
- 7-day forecast with temperature and precipitation
- Best time to visit recommendations
- Seasonal activity suggestions based on weather

### 7. Booking Enquiry Page Prompt

**Component Structure:**
- Booking progress indicator
- Date and accommodation selection
- Guest details form
- Special requests section
- Enquiry confirmation

**Detailed Design Specifications:**

**Progress Indicator:**
- Horizontal progress bar with forest-themed icons
- Steps: "Select Dates" → "Choose Room" → "Guest Details" → "Submit Enquiry"
- Active step highlighting with Forest Green color
- Completed steps with checkmark icons

**Date Selection:**
- Large interactive calendar with availability indicators
- Available dates: Forest Green background
- Unavailable dates: Gray background with diagonal lines
- Selected dates: Sunset Orange background
- Price display: Dynamic pricing updates based on selected dates
- Mobile: Compact calendar with swipe navigation

**Accommodation Selection:**
- Horizontal scrolling cards with room options
- Card content: Room images, names, amenities, pricing comparison
- Selection: Radio button with visual feedback
- Comparison feature: Side-by-side room comparison modal

**Guest Details Form:**
- Clean form design with grouped sections
- Required fields: Name, email, phone, number of guests
- Optional fields: Special dietary requirements, accessibility needs
- Form validation: Real-time validation with inline error messages
- Auto-save: Form data saved to local storage

**Special Requests:**
- Expandable textarea for additional requirements
- Predefined options: Vegetarian meals, early check-in, transportation
- Character counter for message length
- File upload for special occasion details

**Confirmation Page:**
- Success animation with checkmark icon
- Enquiry reference number display
- Next steps information: Expected response time, contact details
- Actions: Print enquiry, add to calendar, share options
- Follow-up: Information about booking confirmation process

## Admin Pages Prompts

### 8. Admin Dashboard Prompt

**Component Structure:**
- Sidebar navigation with collapsible menu
- Main dashboard with KPI widgets
- Recent activity feed
- Quick action buttons
- Notification center

**Detailed Design Specifications:**

**Sidebar Navigation:**
- Width: 280px expanded / 60px collapsed
- Background: Dark Forest Green (#1a3a0f) with subtle texture
- Logo: Resort logo with white text treatment
- Menu items: Dashboard, Enquiries, Content, Analytics, SEO, Settings
- Icons: Custom admin icons with hover animations
- Active state: Lighter green background with left border accent
- Collapse toggle: Hamburger icon with smooth animation
- Mobile: Overlay drawer with backdrop

**KPI Widgets Grid:**
- Layout: 4-column grid (desktop) / 2-column (tablet) / 1-column (mobile)
- Widget design: White cards with colored accent borders
- Content: Large metric number, label, percentage change indicator
- Charts: Sparkline charts for trend visualization
- Colors: Forest Green, Sunset Orange, Sky Blue, Leaf Green
- Hover effects: Shadow increase, subtle scale animation

**Recent Activity Feed:**
- Timeline layout with activity icons
- Activity types: New enquiries, content updates, user actions
- Timestamps: Relative time display ("2 hours ago")
- Action buttons: Quick response options for each activity
- Auto-refresh: Real-time updates with smooth animations

**Quick Actions:**
- Floating action buttons for common tasks
- Actions: "New Enquiry", "Update Content", "View Analytics", "Export Data"
- Design: Circular buttons with Forest Green background
- Hover effects: Scale animation, tooltip display
- Mobile: Bottom navigation bar with quick actions

### 9. Admin Analytics Dashboard Prompt

**Component Structure:**
- Analytics overview header
- Real-time visitor map
- Traffic analytics charts
- Conversion funnel visualization
- Customer insights dashboard

**Detailed Design Specifications:**

**Analytics Header:**
- Date range selector with preset options (7 days, 30 days, 3 months)
- Export buttons: PDF, Excel, CSV with respective icons
- Refresh button: Manual refresh with loading animation
- Real-time indicator: Live dot with pulse animation

**Real-time Visitor Map:**
- Interactive world map with visitor location dots
- Color coding: Different colors for visitor sources
- Animation: Gentle pulsing dots for active visitors
- Info panel: Live visitor count, top countries, active pages
- Mobile: Simplified list view with country flags

**Traffic Charts:**
- Chart types: Line charts, bar charts, pie charts, area charts
- Color scheme: Forest Green primary with complementary colors
- Interactive tooltips: Detailed information on hover
- Zoom functionality: Click and drag to zoom into time periods
- Legend: Toggle data series visibility

**Conversion Funnel:**
- Horizontal funnel chart with decreasing width bars
- Stages: Homepage Visit → Accommodation View → Booking Form → Enquiry Submitted
- Conversion percentages: Large numbers with trend indicators
- Click-through: Detailed breakdown for each stage
- Color gradient: Forest Green to Sunset Orange

**Customer Insights:**
- Mixed widget layout with various chart types
- Demographics: Age groups (donut chart), locations (map), devices (bar chart)
- Behavior: Popular pages, session duration, bounce rates
- Booking patterns: Seasonal trends, accommodation preferences
- Export functionality: Individual widget data export

### 10. Admin SEO Management Panel Prompt (Phase 2)

**Component Structure:**
- SEO dashboard overview
- Technical SEO health checker
- Keyword ranking tracker
- Content optimization tools
- Local SEO management

**Detailed Design Specifications:**

**SEO Overview:**
- Overall SEO score: Large gauge chart (0-100) with color coding
- Quick stats: Organic traffic, keyword rankings, page speed scores
- Alert notifications: Critical issues requiring immediate attention
- Improvement suggestions: Prioritized action items

**Technical SEO Section:**
- Core Web Vitals: Three gauge charts for LCP, INP, CLS
- Site health checklist: Green checkmarks and red X marks
- Issues list: Sortable table with severity indicators
- Quick fix buttons: One-click solutions for common problems

**Keyword Tracker:**
- Sortable data table with search functionality
- Columns: Keyword, current position, change indicator, search volume
- Visual indicators: Up/down arrows with color coding
- Add keyword functionality: Modal form for new keyword tracking
- Export options: CSV, Excel with filtered data

**Content Optimization:**
- Page scoring cards: Grid layout with SEO scores for each page
- Optimization suggestions: Detailed recommendations for improvement
- Meta tag editor: Inline editing for titles and descriptions
- Content analysis: Keyword density, readability scores

**Local SEO Management:**
- Google My Business integration: Status dashboard and review management
- Citation tracking: Consistency checker across directories
- Local keyword performance: Position tracking for location-based terms
- Review management: Response templates and rating analytics

### 11. Admin Booking Management Prompt

**Component Structure:**
- Enquiry overview dashboard
- Detailed enquiry management interface
- Customer communication tools
- Export and reporting functionality
- Calendar integration

**Detailed Design Specifications:**

**Enquiry Dashboard:**
- Status overview: Cards showing enquiry counts by status
- Recent enquiries: List view with quick action buttons
- Priority indicators: High-priority enquiries highlighted
- Response time metrics: Average response time tracking

**Enquiry Management Interface:**
- Master-detail layout: List left, details right
- List design: Compact cards with customer info and status
- Status indicators: Color-coded badges (New, Contacted, Confirmed, Cancelled)
- Quick actions: Call, email, update status buttons
- Search and filter: Advanced filtering options

**Customer Communication:**
- Communication history: Timeline of all interactions
- Quick response templates: Pre-written responses for common scenarios
- Call logging: Integration with phone system for call tracking
- Email integration: Send emails directly from the interface
- SMS functionality: Quick SMS sending with templates

**Export Functionality:**
- Export modal: Filter options and format selection
- Formats: Excel, CSV, PDF with preview thumbnails
- Custom fields: Select specific data fields for export
- Scheduled exports: Automated report generation
- Progress indicator: Loading animation during export

**Calendar Integration:**
- Monthly calendar view: All bookings and enquiries displayed
- Drag-and-drop: Move enquiries between dates
- Availability overlay: Show room availability on calendar
- Booking conflicts: Highlight potential scheduling conflicts
- Mobile: Agenda view with swipe navigation

## Component Prompts

### 12. Navigation Component Prompt

**Desktop Navigation:**
- Horizontal layout with logo left, menu items center, CTA right
- Transparent background with backdrop-blur on scroll
- Menu items: Hover animations with underline effect
- Dropdown menus: Smooth slide-down animation for sub-items
- CTA button: "Book Now" with Sunset Orange background

**Mobile Navigation:**
- Hamburger menu icon with animated transformation to X
- Slide-out drawer from right side with backdrop overlay
- Menu items: Stacked vertical layout with touch-friendly spacing
- Social links: Footer section of mobile menu
- Close animation: Smooth slide-out with backdrop fade

### 13. Card Components Prompt

**Accommodation Cards:**
- Aspect ratio: 4:3 for images
- Content padding: 20px all sides
- Hover effects: translateY(-8px) with shadow increase
- Image overlay: Gradient overlay on hover
- CTA button: Full-width with rounded corners

**Experience Cards:**
- Hexagonal shape with CSS clip-path
- Background image with color overlay
- Content positioning: Centered text with icon
- Hover animation: Scale(1.05) with rotation
- Mobile fallback: Rectangular cards

**Blog/News Cards:**
- Vertical layout with image top, content bottom
- Read time indicator: Small badge with clock icon
- Author information: Avatar, name, date
- Tag system: Colored tags for categorization
- Excerpt: 2-line text with ellipsis overflow

### 14. Form Components Prompt

**Input Fields:**
- Border radius: 8px with Forest Green focus border
- Padding: 12px horizontal, 16px vertical
- Placeholder styling: Light gray with italic text
- Error states: Red border with error message below
- Success states: Green border with checkmark icon

**Date Pickers:**
- Custom calendar styling with Forest Green accents
- Month navigation: Arrow buttons with hover effects
- Date selection: Highlighted dates with Sunset Orange
- Range selection: Connected date highlighting
- Mobile: Native date picker fallback

**Dropdown Selects:**
- Custom styling with arrow icon
- Option hover states: Light gray background
- Multi-select: Checkbox options with select all
- Search functionality: Filter options as user types
- Mobile: Native select fallback for better UX

### 15. Modal Components Prompt

**Accommodation Detail Modal:**
- Full-screen overlay with centered content
- Max-width: 1200px with responsive scaling
- Close button: Top-right with hover animation
- Backdrop: Click to close with confirmation
- Scroll behavior: Body scroll lock when modal open

**Booking Confirmation Modal:**
- Success animation: Checkmark with bounce effect
- Content: Booking details with reference number
- Actions: Print, email, add to calendar buttons
- Auto-close: Timer with countdown display
- Mobile: Full-screen modal with slide-up animation

**Image Lightbox Modal:**
- Dark background with image centering
- Navigation: Left/right arrows with keyboard support
- Zoom functionality: Click to zoom, scroll to pan
- Thumbnail strip: Bottom navigation with current indicator
- Mobile: Swipe gestures for navigation

## Popup and Modal Prompts

### 16. Booking Widget Popup Prompt

**Floating Booking Widget:**
- Position: Fixed bottom-right (desktop) / bottom full-width (mobile)
- Design: White card with Forest Green accent border
- Animation: Slide-up entrance with bounce effect
- Collapse state: Minimized with expand button
- Form elements: Date pickers, guest selector, submit button

**Request a Stay Modal:**
- Trigger: CTA buttons throughout the site
- Content: Simplified booking form with essential fields
- Progress: Step indicator for multi-step process
- Validation: Real-time validation with error highlighting
- Success: Confirmation message with next steps

### 17. Gallery Lightbox Prompt

**Image Viewer:**
- Full-screen overlay with dark background
- Image: Centered with max dimensions for viewport
- Controls: Previous/next arrows, close button, zoom controls
- Information: Image title, description, metadata
- Sharing: Social media share buttons

**Virtual Tour Modal:**
- 360-degree viewer with custom controls
- Hotspots: Interactive points with information popups
- Navigation: Room-to-room transitions
- Fullscreen: Option for immersive viewing
- Mobile: Touch controls for pan and zoom

### 18. Contact Form Popup Prompt

**Quick Contact Modal:**
- Trigger: Contact buttons and links
- Form: Name, email, phone, message fields
- Validation: Required field indicators and error messages
- Submit: Loading animation with success/error feedback
- Follow-up: Confirmation message with response timeline

**Callback Request Popup:**
- Minimal form: Name, phone, preferred time
- Time selector: Dropdown with available time slots
- Urgency indicator: Priority level selection
- Confirmation: Success message with callback timeline
- Mobile: Full-screen modal for better UX

## Subpage and Detail View Prompts

### 19. Individual Accommodation Detail Page Prompt

**Page Structure:**
- Hero image gallery with navigation
- Accommodation information sidebar
- Amenities and features section
- Guest reviews and ratings
- Related accommodations
- Booking integration

**Hero Gallery:**
- Main image: Large display with aspect ratio 16:9
- Thumbnail navigation: Horizontal scroll with active indicator
- Lightbox: Click to open full-screen gallery
- Virtual tour: 360-degree view integration
- Mobile: Swipeable gallery with dot indicators

**Information Sidebar:**
- Accommodation name and rating
- Price display with seasonal variations
- Key amenities with icons
- Availability calendar
- Instant booking button
- Share options: Social media and direct link

**Reviews Section:**
- Overall rating: Large star display with average score
- Review cards: Guest name, rating, comment, date
- Filtering: Sort by rating, date, guest type
- Pagination: Load more reviews functionality
- Write review: Modal form for guest feedback

### 20. Experience Detail Page Prompt

**Page Layout:**
- Hero section with activity images
- Experience information and booking
- What's included/excluded lists
- Safety information and requirements
- Related experiences
- Guest testimonials

**Experience Information:**
- Activity name and category
- Duration, difficulty, group size
- Detailed description with highlights
- Pricing structure with group discounts
- Booking calendar with availability
- Instant booking functionality

**Safety Section:**
- Requirements: Age limits, fitness level, equipment
- Safety measures: Certified guides, equipment quality
- Weather considerations: Seasonal availability
- Cancellation policy: Terms and conditions
- Emergency procedures: Safety protocols

### 21. Admin Individual Enquiry Detail Page Prompt

**Enquiry Overview:**
- Customer information card
- Booking details summary
- Current status with timeline
- Priority level indicator
- Assigned staff member

**Communication Panel:**
- Message history: Chronological conversation thread
- Quick responses: Template messages for common replies
- Call logging: Record of phone conversations
- Email integration: Send/receive emails within interface
- Notes section: Internal staff notes and reminders

**Action Panel:**
- Status update: Dropdown with confirmation
- Booking confirmation: Generate booking reference
- Payment tracking: Record payment status
- Calendar integration: Add to booking calendar
- Customer follow-up: Automated reminder settings

This comprehensive prompt structure provides detailed specifications for each page, component, popup, and subpage, enabling individual development and testing of each element while maintaining consistency across the entire application.