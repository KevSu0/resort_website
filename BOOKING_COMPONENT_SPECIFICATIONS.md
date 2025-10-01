# Booking Flow Component Specifications

## Type Definitions

```typescript
// Core Booking Types
interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface GuestCount {
  adults: number;
  children: number;
  infants?: number;
}

interface GuestInformation {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  specialRequests?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

interface BookingSummary {
  id: string;
  referenceNumber: string;
  property: Property;
  roomType: RoomType;
  dates: DateRange;
  guests: GuestCount;
  guestInfo: GuestInformation;
  pricing: PriceBreakdown;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
}

interface PriceBreakdown {
  baseRate: number;
  nights: number;
  subtotal: number;
  taxes: number;
  fees: number;
  discounts: number;
  total: number;
  currency: string;
  paymentSchedule?: PaymentSchedule[];
}

interface PaymentSchedule {
  dueDate: Date;
  amount: number;
  description: string;
  status: 'pending' | 'paid' | 'overdue';
}

type BookingStatus =
  | 'draft'
  | 'pending_review'
  | 'reviewing'
  | 'contacted'
  | 'confirmed'
  | 'payment_required'
  | 'payment_pending'
  | 'paid'
  | 'cancelled'
  | 'rejected'
  | 'modified';

interface StatusTimeline {
  id: string;
  status: BookingStatus;
  timestamp: Date;
  message: string;
  actor: 'system' | 'admin' | 'customer';
  attachments?: string[];
}

interface Message {
  id: string;
  bookingId: string;
  sender: 'admin' | 'customer';
  content: string;
  timestamp: Date;
  attachments: MessageAttachment[];
  read: boolean;
}

interface MessageAttachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document' | 'pdf';
  size: number;
}

interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  whatsapp: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
}

interface CheckInStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate?: Date;
  required: boolean;
  component: string;
}
```

## 1. BookingWidget Component

```typescript
interface BookingWidgetProps {
  propertyId: string;
  property: Property;
  availableRooms: RoomType[];
  initialDates?: DateRange;
  initialGuests?: GuestCount;
  className?: string;
  onBookingInitiated: (bookingData: InitialBookingData) => void;
}

interface InitialBookingData {
  propertyId: string;
  roomTypeId?: string;
  dates: DateRange;
  guests: GuestCount;
}
```

**Component Features:**
- Real-time date availability checking
- Guest count selector with validation
- Room type selection with capacity validation
- Price preview with dynamic calculations
- Mobile-responsive design
- Loading states for API calls

**User Interactions:**
1. Date selection with calendar UI
2. Guest count adjustment via stepper controls
3. Room type filtering based on availability
4. Price preview updates in real-time
5. "Book Now" CTA that initiates booking flow

## 2. DateSelector Component

```typescript
interface DateSelectorProps {
  availableDates: Date[];
  blockedDates: Date[];
  minStay: number;
  maxStay?: number;
  selectedDates?: DateRange;
  onDateChange: (dates: DateRange) => void;
  disabled?: boolean;
  className?: string;
}
```

**Component Features:**
- Interactive calendar with availability visualization
- Minimum/maximum stay enforcement
- Check-in/check-out day restrictions
- Highlighted available/unavailable dates
- Mobile-optimized calendar view
- Date validation with user-friendly error messages

**Visual States:**
- Available dates (green background)
- Unavailable dates (gray background, disabled)
- Selected dates (blue background)
- Check-in date (green border)
- Check-out date (red border)

## 3. GuestSelector Component

```typescript
interface GuestSelectorProps {
  maxCapacity: number;
  currentGuests: GuestCount;
  onGuestChange: (guests: GuestCount) => void;
  showInfants?: boolean;
  className?: string;
}
```

**Component Features:**
- Stepper controls for guest counts
- Capacity validation and warnings
- Child age collection (if required)
- Infant option for family bookings
- Real-time price updates based on guest count

**Validation Rules:**
- Minimum 1 adult required
- Total guests cannot exceed room capacity
- Special pricing for additional guests
- Age verification for children/infants

## 4. RoomSelector Component

```typescript
interface RoomSelectorProps {
  rooms: RoomType[];
  selectedDates: DateRange;
  guestCount: GuestCount;
  selectedRoomId?: string;
  onRoomSelect: (roomId: string) => void;
  pricing: RoomPricing[];
  className?: string;
}

interface RoomPricing {
  roomTypeId: string;
  baseRate: number;
  totalRate: number;
  available: boolean;
  pricePerNight: number;
}
```

**Component Features:**
- Room cards with images and amenities
- Price comparison across room types
- Availability status indicators
- Capacity matching with guest count
- Sorting options (price, capacity, rating)

**Room Card Information:**
- High-quality room images
- Capacity and size information
- Included amenities list
- Price breakdown per night
- Availability status
- "Select Room" CTA

## 5. BookingSummary Component

```typescript
interface BookingSummaryProps {
  bookingDetails: BookingSummary;
  editable?: boolean;
  onEdit: (section: string) => void;
  className?: string;
}
```

**Component Features:**
- Comprehensive booking details display
- Editable sections (when allowed)
- Price breakdown with taxes and fees
- Cancellation policy display
- Terms and conditions acceptance
- Progress indicator for booking steps

**Sections:**
1. Property and room details
2. Dates and duration
3. Guest information
4. Special requests
5. Price breakdown
6. Cancellation policy
7. Terms acceptance

## 6. StatusTracker Component

```typescript
interface StatusTrackerProps {
  bookingId: string;
  currentStatus: BookingStatus;
  timeline: StatusTimeline[];
  showActions?: boolean;
  onActionClick?: (action: BookingAction) => void;
  className?: string;
}
```

**Component Features:**
- Visual timeline of booking status changes
- Real-time status updates via websockets
- Actionable items based on current status
- Communication thread integration
- Document sharing capabilities

**Timeline Features:**
- Chronological status changes
- Actor identification (admin/customer/system)
- Message content with attachments
- Estimated completion times
- Next step indicators

## 7. MessagingInterface Component

```typescript
interface MessagingInterfaceProps {
  bookingId: string;
  messages: Message[];
  onSendMessage: (content: string, files?: File[]) => void;
  onMarkAsRead: (messageId: string) => void;
  adminOnlineStatus: boolean;
  className?: string;
}
```

**Component Features:**
- Real-time messaging with admin
- File and document sharing
- Message read status indicators
- Typing indicators
- Message history with search
- Attachment preview capabilities

**Message Types:**
- Text messages with rich formatting
- Image attachments with preview
- Document uploads (PDF, DOC, etc.)
- Location sharing
- Quick response templates

## 8. PaymentProcessor Component

```typescript
interface PaymentProcessorProps {
  bookingId: string;
  amountDue: number;
  paymentSchedule: PaymentSchedule[];
  onPaymentComplete: (paymentResult: PaymentResult) => void;
  onError: (error: PaymentError) => void;
  className?: string;
}

interface PaymentResult {
  success: boolean;
  transactionId: string;
  amount: number;
  timestamp: Date;
  method: string;
}
```

**Component Features:**
- Secure payment form with multiple methods
- Payment schedule management
- Tokenized payment method storage
- Automatic retry for failed payments
- Receipt generation and download

**Payment Methods:**
- Credit/Debit cards
- Bank transfers
- Digital wallets (PayPal, Apple Pay, Google Pay)
- Cryptocurrency (if supported)
- Buy now, pay later options

## 9. NotificationCenter Component

```typescript
interface NotificationCenterProps {
  userId?: string;
  guestEmail: string;
  notifications: Notification[];
  preferences: NotificationPreferences;
  onPreferencesChange: (preferences: NotificationPreferences) => void;
  onMarkAsRead: (notificationId: string) => void;
  className?: string;
}

interface Notification {
  id: string;
  type: 'status' | 'payment' | 'message' | 'reminder' | 'alert';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
}
```

**Component Features:**
- Centralized notification management
- Multi-channel delivery preferences
- Notification categorization and filtering
- Push notification support
- Email/SMS integration
- Real-time notification updates

## 10. PreArrivalPortal Component

```typescript
interface PreArrivalPortalProps {
  bookingId: string;
  checkInDate: Date;
  checkInSteps: CheckInStep[];
  documentRequirements: DocumentRequirement[];
  arrivalInfo: ArrivalInformation;
  onStepComplete: (stepId: string) => void;
  onDocumentUpload: (documents: File[]) => void;
  className?: string;
}

interface DocumentRequirement {
  id: string;
  name: string;
  description: string;
  required: boolean;
  dueDate: Date;
  status: 'pending' | 'uploaded' | 'verified' | 'rejected';
  acceptedFormats: string[];
}
```

**Component Features:**
- Step-by-step check-in process
- Document upload and verification
- Arrival time and transportation details
- Room preference selection
- Special requests management
- Digital key access

**Check-in Steps:**
1. Personal information verification
2. Document upload (ID, visa, etc.)
3. Arrival details confirmation
4. Payment completion
5. Room preferences
6. Special requests
7. Digital key activation

## Interaction Flows

### Booking Initiation Flow

```
1. User visits property page
2. BookingWidget loads with property data
3. User selects dates → DateSelector validates availability
4. User selects guests → GuestSelector validates capacity
5. User selects room → RoomSelector shows available options
6. Price calculation updates in real-time
7. User clicks "Book Now" → Navigate to guest information
```

### Guest Information Flow

```
1. Load GuestInfoForm component
2. Check if user is logged in
   - Yes: Pre-fill information from profile
   - No: Show guest form with registration option
3. Validate all required fields
4. Optional: Create account for future bookings
5. Navigate to booking review
```

### Booking Review Flow

```
1. Load BookingSummary with all details
2. Show comprehensive price breakdown
3. Display cancellation policy
4. Present terms and conditions
5. User accepts terms → Submit booking
6. Show loading state while processing
7. Navigate to confirmation page
```

### Status Tracking Flow

```
1. Load StatusTracker with current status
2. Display timeline of all status changes
3. Show next expected status and ETA
4. Provide communication options if needed
5. Update status in real-time via websockets
6. Notify user of status changes
```

### Payment Processing Flow

```
1. Load PaymentProcessor with amount due
2. Present payment method options
3. User selects payment method
4. Load secure payment form
5. Validate payment details
6. Process payment via secure gateway
7. Show payment confirmation or error
8. Update booking status accordingly
```

## Error Handling Strategies

### Validation Errors
- Field-level validation with specific error messages
- Form-level validation with summary of all errors
- Prevent progression until errors are resolved
- Provide clear guidance for correction

### Network Errors
- Automatic retry with exponential backoff
- Offline mode with local data storage
- Clear error messaging with retry options
- Graceful degradation of features

### Payment Errors
- Specific error messages for different failure types
- Alternative payment method suggestions
- Retry mechanisms with saved payment methods
- Admin notification for payment issues

## Performance Considerations

### Loading States
- Skeleton screens for content loading
- Progress indicators for long operations
- Optimistic UI updates for better perceived performance
- Lazy loading for non-critical components

### Caching Strategies
- Property data caching for quick access
- Availability data with TTL (time to live)
- User session persistence across booking steps
- Offline support for basic functionality

### Optimization Techniques
- Code splitting for booking flow components
- Image optimization for room photos
- API call batching to reduce requests
- Progressive enhancement for slow connections