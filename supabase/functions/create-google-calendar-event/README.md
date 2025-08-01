# Create Google Calendar Event - Supabase Edge Function

This Edge Function creates new calendar events in Liisa's Google Calendar with client information and booking details.

## Features

- ✅ Validates client information and booking times
- ✅ Fetches Liisa's refresh token from `google_auth` table
- ✅ Creates calendar events with client details
- ✅ Adds both client and Liisa as attendees
- ✅ Sets up email and popup reminders
- ✅ Returns success confirmation with event details
- ✅ Comprehensive input validation and error handling

## Setup Instructions

### 1. Environment Variables

Ensure these environment variables are set in your Supabase project:

```bash
# Google OAuth credentials (same as get-google-calendar-events)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Supabase credentials (auto-configured)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Google Calendar API Permissions

Ensure your Google OAuth app has these scopes:
- `https://www.googleapis.com/auth/calendar.events`
- `https://www.googleapis.com/auth/calendar`

### 3. Deploy the Function

```bash
# Deploy to Supabase
supabase functions deploy create-google-calendar-event
```

## Usage

### Request Format

```javascript
const response = await fetch('/functions/v1/create-google-calendar-event', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${supabaseAccessToken}`
  },
  body: JSON.stringify({
    clientName: 'Matti Meikäläinen',
    clientEmail: 'matti@example.com',
    startTime: '2024-01-15T10:00:00+02:00',
    endTime: '2024-01-15T11:00:00+02:00',
    serviceType: 'Äitiysfysioterapia',
    notes: 'Ensimmäinen käynti'
  })
})
```

### Response Format

```json
{
  "success": true,
  "message": "Calendar event created successfully",
  "eventId": "abc123def456",
  "eventLink": "https://calendar.google.com/event?eid=abc123def456",
  "summary": "Äitiysfysioterapia - Matti Meikäläinen",
  "startTime": "2024-01-15T10:00:00+02:00",
  "endTime": "2024-01-15T11:00:00+02:00"
}
```

## Input Validation

The function validates:

- ✅ **Required fields**: clientName, clientEmail, startTime, endTime, serviceType
- ✅ **Email format**: Valid email address format
- ✅ **Date logic**: Start time must be in the future
- ✅ **Time logic**: End time must be after start time
- ✅ **Date format**: Valid ISO 8601 date strings

## Event Details

Created events include:

- **Summary**: `{serviceType} - {clientName}`
- **Description**: Client details, service type, and optional notes
- **Attendees**: Both client and Liisa (liisa@liisakinnunen.fi)
- **Reminders**: 
  - Email reminder 24 hours before
  - Popup reminder 30 minutes before
- **Time Zone**: Europe/Helsinki

## Error Handling

The function returns appropriate HTTP status codes:

- `400`: Missing required fields, invalid email, or date validation errors
- `404`: Refresh token not found
- `500`: Google API errors or internal server errors

## Security Features

- ✅ **Input validation**: Comprehensive validation of all inputs
- ✅ **Email validation**: Regex pattern for email format
- ✅ **Date validation**: Ensures future dates and logical time ranges
- ✅ **Service role**: Uses Supabase service role for database access
- ✅ **Error logging**: Detailed error logging for debugging

## Testing

Test the function with curl:

```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/create-google-calendar-event' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer your_anon_key' \
  -d '{
    "clientName": "Test Client",
    "clientEmail": "test@example.com",
    "startTime": "2024-01-15T10:00:00+02:00",
    "endTime": "2024-01-15T11:00:00+02:00",
    "serviceType": "Personal Trainer",
    "notes": "Test booking"
  }'
```

## Integration with Booking System

This function can be integrated with your booking system to:

1. **Validate availability** before creating events
2. **Send confirmation emails** to clients
3. **Update booking status** in your database
4. **Handle payment processing** before creating calendar events

## Example Integration

```javascript
// Check availability first
const availabilityResponse = await fetch('/functions/v1/get-google-calendar-events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    startDate: '2024-01-15T00:00:00+02:00',
    endDate: '2024-01-15T23:59:59+02:00'
  })
})

const availability = await availabilityResponse.json()

// Check if time slot is available
const isAvailable = !availability.bookedSlots.some(event => 
  event.start === '2024-01-15T10:00:00+02:00'
)

if (isAvailable) {
  // Create the booking
  const bookingResponse = await fetch('/functions/v1/create-google-calendar-event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookingData)
  })
}
``` 