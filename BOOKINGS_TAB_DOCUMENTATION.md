# Bookings Tab Documentation

## Overview
The **BookingsTab** component is a comprehensive demo booking management system with role-based views for Students and Admins. It includes scheduling, booking management, status tracking, and a custom calendar visualization.

---

## Component Architecture

### Main Components
1. **BookingsTab** - Main container component
2. **ActionModal** - Admin modal for managing bookings
3. **Schedule Demo Modal** - Admin modal for creating demo sessions
4. **Custom Calendar** - Visual calendar for students

### File Location
`client/src/dashboard/BookingsTab.jsx`

---

## User Flows

### 👨‍🎓 Student Flow

#### 1. View Upcoming Demo Sessions
- **Location**: Top of the page (when available)
- **Features**:
  - Lists all future demo sessions (today or later)
  - Shows countdown labels: "Today", "Tomorrow", "In X days"
  - Color-coded urgency (orange for sessions within 2 days)
  - Displays session details:
    - Date block with day number and month
    - Session title
    - Time and instructor
    - Type badge (FREE or PAID with price)
    - Category badge (Junior/Professional)
    - Description
  - **Book Now** button to instantly book the session

#### 2. View My Bookings
- **Location**: Main content area (left side on desktop)
- **Features**:
  - Filter bookings by status:
    - All
    - Pending
    - Confirmed
    - Completed
    - Cancelled
  - Each booking card shows:
    - Class name
    - Student name and grade
    - Booking creation date
    - Status badge with color coding
    - Confirmed demo date/time (if scheduled)
  - **Cancel** button for pending/confirmed bookings

#### 3. View Calendar
- **Location**: Right sidebar (desktop) / Below bookings (mobile)
- **Features**:
  - Custom-built interactive calendar
  - Month navigation (previous/next buttons)
  - **Visual Indicators**:
    - Orange gradient: Today's date
    - Green gradient: Dates with confirmed demos
    - Pulsing dot: Animation on booking dates
  - **Hover Tooltips**: Show class name and time
  - **Legend**: Explains color meanings

---

### 👨‍💼 Admin Flow

#### 1. Schedule New Demo Sessions
- **Trigger**: "Schedule New Demo Session" button at the top
- **Modal Form Fields**:
  - **Link to Class** (optional dropdown)
    - Auto-fills title, category when selected
  - **Session Title** (required)
  - **Category** (dropdown):
    - All Students
    - Junior
    - Professional
  - **Type** (dropdown):
    - Free Demo
    - Paid Demo
  - **Price** (conditional field - only for paid demos)
  - **Date** (required, min: today)
  - **Time** (required)
  - **Instructor** (default: "AcadLearn Team")
  - **Description** (optional textarea)

- **Actions**:
  - **Schedule Demo**: Submits form
  - **Clear**: Resets all fields
  - **Cancel**: Closes modal

- **Success Behavior**:
  - Shows success message
  - Reloads page after 1.5 seconds
  - New session appears in student view

#### 2. View All Demo Bookings
- **Location**: Main content area (full width for admin)
- **Features**:
  - Same filter system as students
  - Shows ALL bookings from all students
  - Each booking displays:
    - Class name
    - Student details (name, grade)
    - Contact info (email, phone, parent name)
    - Booking creation date
    - Current status
    - Current scheduled date/time (if set)
  - **Manage** button on each booking

#### 3. Manage Individual Bookings
- **Trigger**: Click "Manage" button on any booking
- **Admin Action Modal**:
  - **Student Info Display**:
    - Class name
    - Student name and parent name
    - Email, phone, booking date
  
  - **Update Status** (4 options):
    - Pending (amber)
    - Confirmed (green)
    - Completed (blue)
    - Cancelled (red)
  
  - **Set Demo Date & Time** (optional):
    - Date picker (min: today)
    - Time picker
  
  - **Actions**:
    - **Save Changes**: Updates booking
    - **Cancel**: Closes modal without saving

---

## State Management

### Component State
```javascript
// Filter & Display
const [filter, setFilter] = useState("all")
const [activeBooking, setActiveBooking] = useState(null)
const [showScheduleModal, setShowScheduleModal] = useState(false)

// Schedule Form (Admin)
const [allClasses, setAllClasses] = useState([])
const [sessionForm, setSessionForm] = useState(EMPTY_SESSION)
const [sessionSaving, setSessionSaving] = useState(false)
const [sessionMsg, setSessionMsg] = useState("")

// Calendar
const [currentMonth, setCurrentMonth] = useState(new Date())
```

### Props
```javascript
{
  bookings,           // Array of demo bookings
  loading,            // Loading state
  onCancel,           // Function to cancel booking (student)
  user,               // Current user object (contains role, token)
  onStatusUpdate,     // Function to update booking status (admin)
  demoSessions,       // Array of scheduled demo sessions
  onBookDemo          // Function to book a demo session
}
```

---

## Key Features Implementation

### 1. Role-Based Rendering
```javascript
const isAdmin = user?.role === "admin"

// Conditionally render based on role:
// - Admin: Schedule button, all bookings, manage actions
// - Student: Upcoming sessions, my bookings, calendar
```

### 2. Status Filtering
```javascript
const FILTERS = ["all", "pending", "confirmed", "completed", "cancelled"]
const shown = filter === "all" 
  ? bookings 
  : bookings.filter((b) => b.status === filter)
```

### 3. Date Calculations
```javascript
// Days until a date
const daysUntil = (dateStr) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil((new Date(dateStr) - today) / (1000 * 60 * 60 * 24))
}

// Filter upcoming sessions
const upcomingSessions = demoSessions.filter((s) => daysUntil(s.date) >= 0)
```

### 4. Calendar Implementation

#### Date Comparison (Timezone-Safe)
```javascript
const getBookingForDate = (date) => {
  // Compare year, month, day separately to avoid timezone issues
  return bookings.find(b => {
    if (b.status !== 'confirmed' || !b.confirmedDate) return false
    const bookingDate = new Date(b.confirmedDate)
    return bookingDate.getFullYear() === date.getFullYear() &&
           bookingDate.getMonth() === date.getMonth() &&
           bookingDate.getDate() === date.getDate()
  })
}
```

#### Calendar Grid Generation
```javascript
const getDaysInMonth = (date) => {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()
  
  return { daysInMonth, startingDayOfWeek, year, month }
}
```

#### Rendering Logic
- Empty cells for days before month start
- Day cells with conditional classes:
  - `.calendar-day-today` - Today's date
  - `.calendar-day-booking` - Date with confirmed booking
- Booking indicator with pulsing dot
- Tooltip overlay on hover

---

## API Integration

### 1. Load All Classes (Admin)
```javascript
GET /api/classes
Headers: Authorization token
Purpose: Populate class dropdown in schedule form
```

### 2. Create Demo Session (Admin)
```javascript
POST /api/demo-sessions
Headers: Authorization token
Body: {
  title, classId, className, instructor,
  description, date, time, category, type, price
}
Purpose: Schedule new demo session for students
```

### 3. Update Booking Status (Admin)
```javascript
// Called via onStatusUpdate prop
Updates: status, confirmedDate, confirmedTime
Purpose: Manage booking lifecycle
```

### 4. Cancel Booking (Student)
```javascript
// Called via onCancel prop
Purpose: Allow students to cancel their bookings
```

---

## Styling & Design

### Color Coding
- **Orange/Amber**: Primary brand colors, today indicator
- **Green**: Confirmed bookings, scheduled dates
- **Amber**: Pending status
- **Blue**: Completed status
- **Red**: Cancelled status

### Visual Effects
- **Gradients**: Orange-to-amber backgrounds
- **Animations**:
  - Pulsing dot on booking dates (2s infinite)
  - Fade-in animation on calendar load
  - Scale transform on hover
- **Shadows**: Layered shadows on hover states
- **Transitions**: 0.2s ease on all interactions

### Responsive Design
- **Desktop**: 
  - Students: 2/3 bookings + 1/3 calendar (3-column grid)
  - Admin: Full width bookings, no calendar
- **Mobile**: 
  - Stacked layout
  - Full-width cards
  - Priority touch targets (min 44px)

---

## CSS Classes (Custom Calendar)

### Navigation
- `.calendar-nav-btn` - Previous/next month buttons
- `.calendar-month-label` - Month/year display

### Structure
- `.calendar-weekdays` - Weekday header row
- `.calendar-weekday` - Individual weekday label
- `.calendar-grid` - 7-column day grid
- `.calendar-day-empty` - Empty cells before month start

### Day States
- `.calendar-day` - Base day cell
- `.calendar-day-today` - Today (orange gradient)
- `.calendar-day-booking` - Booking date (green gradient)
- `.calendar-day-number` - Day number text

### Booking Indicators
- `.booking-indicator` - Container for dot and tooltip
- `.booking-dot` - Pulsing dot animation
- `.booking-tooltip` - Hover tooltip with details

---

## Form Validation

### Schedule Demo Form
- **Required Fields**:
  - Session title
  - Category (default: all)
  - Type (default: free)
  - Date (min: today)
  - Time
- **Conditional Required**:
  - Price (required only when type = "paid", must be > 0)

### Admin Action Modal
- **Optional Fields**:
  - Demo date (min: today)
  - Demo time
- Status always has a value (initialized from booking)

---

## Data Flow

### Student Booking Flow
```
1. Student views upcoming demo sessions
2. Clicks "Book Now" → onBookDemo(session)
3. Parent component handles booking creation
4. New booking appears in "My Demo Bookings"
5. Admin confirms and sets date
6. Date appears on student's calendar
```

### Admin Scheduling Flow
```
1. Admin clicks "Schedule New Demo Session"
2. Fills form (optionally links to existing class)
3. Submits → POST /api/demo-sessions
4. Session saved to database
5. Appears in student "Upcoming Demo Sessions"
6. Students can book the session
```

### Booking Management Flow
```
1. Admin clicks "Manage" on any booking
2. Modal opens with booking details
3. Admin updates status and/or sets date/time
4. Clicks "Save Changes" → onStatusUpdate()
5. Booking updated in database
6. Student sees updated status and confirmed date
7. If confirmed, date appears on student calendar
```

---

## Helper Functions

### `daysUntil(dateStr)`
Calculates days remaining until a date.

### `sessionToCls(session)`
Converts DemoSession to Class format for BookDemoModal.

### `fmtDate(dateStr)`
Formats date string for display (from constants).

### `authHeader(token)`
Creates Authorization header (from constants).

### `getBookingForDate(date)`
Finds booking for a specific calendar date.

### `getDaysInMonth(date)`
Gets calendar data for a given month.

### `changeMonth(increment)`
Navigates calendar forward/backward.

### `isToday(date)`
Checks if date is today.

---

## Status Badge Colors

Defined in `STATUS_STYLES` constant:
- **Pending**: `bg-amber-100 text-amber-600`
- **Confirmed**: `bg-green-100 text-green-600`
- **Completed**: `bg-blue-100 text-blue-600`
- **Cancelled**: `bg-red-100 text-red-600`

---

## Accessibility Features

- Semantic HTML (dialog role on modals)
- `aria-modal="true"` on modal containers
- `aria-label` on navigation buttons
- Keyboard navigation support
- Focus management on modal open/close
- Screen reader friendly status updates

---

## Performance Optimizations

- `useCallback` for class loading function
- Conditional rendering (admin vs student views)
- Lazy evaluation of calendar grid (IIFE in render)
- Debounced API calls via loading states
- Minimal re-renders with proper state management

---

## Error Handling

### Schedule Form
- Try-catch around API calls
- Display error messages via `sessionMsg` state
- Validation feedback for required fields
- Network error fallback messages

### Class Loading
- Graceful degradation if classes fail to load
- Empty array fallback

---

## Future Enhancement Ideas

1. **Real-time Updates**: WebSocket for instant booking notifications
2. **Bulk Actions**: Select multiple bookings for batch operations
3. **Email Notifications**: Automatic emails on status changes
4. **Recurring Sessions**: Weekly/monthly demo schedules
5. **Calendar Export**: iCal/Google Calendar integration
6. **Search & Filters**: Advanced filtering by date range, student name
7. **Analytics Dashboard**: Booking statistics for admin
8. **Payment Integration**: Handle paid demo payments

---

## Testing Guidelines

### Unit Tests
- Date calculation functions
- Filter logic
- Calendar grid generation
- Form validation

### Integration Tests
- Student booking flow
- Admin scheduling flow
- Status update workflow
- Calendar navigation

### E2E Tests
- Complete student journey
- Complete admin journey
- Cross-role interactions

---

## Dependencies

### Internal
- `./constants` - fmtDate, STATUS_STYLES, authHeader
- `../config/api` - API_BASE URL

### External
- `react` - useState, useEffect, useCallback

### CSS
- Custom calendar styles in `index.css`
- Tailwind utility classes

---

## Deployment Checklist

✅ Environment variables configured (API_BASE)
✅ Authentication tokens properly secured
✅ CORS headers configured on backend
✅ Date/time timezone handling verified
✅ Mobile responsive design tested
✅ Browser compatibility verified
✅ API endpoints secured with auth middleware
✅ Input validation on both client and server
✅ Error boundaries implemented
✅ Loading states for all async operations

---

## Maintenance Notes

- Calendar logic is custom-built (no external library)
- Date comparisons use local time to avoid timezone issues
- Price field requires Number conversion before API submission
- Page reload used after successful scheduling (consider optimizing)
- All modals use backdrop blur and click-outside-to-close pattern

---

**Last Updated**: February 2026  
**Version**: 2.0  
**Maintained By**: AcadLearn Development Team
