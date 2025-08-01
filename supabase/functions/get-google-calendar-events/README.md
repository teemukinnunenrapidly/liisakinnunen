# Get Google Calendar Events - Supabase Edge Function

This Edge Function fetches Google Calendar events for a specified date range and returns booked time slots.

## Features

- ✅ Fetches refresh token from `google_auth` table
- ✅ Exchanges refresh token for access token
- ✅ Retrieves calendar events from Google Calendar API
- ✅ Filters out cancelled events
- ✅ Returns formatted booked time slots
- ✅ Includes CORS headers for web client access

## Setup Instructions

### 1. Environment Variables

Set these environment variables in your Supabase project:

```bash
# Google OAuth credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Supabase credentials (usually auto-configured)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Set application type to "Web application"
   - Add authorized redirect URIs
5. Copy the Client ID and Client Secret

### 3. Google Auth Table Setup

Ensure the `google_auth` table exists with Liisa's refresh token:

```sql
-- Insert Liisa's refresh token (replace with actual token)
INSERT INTO google_auth (user_id, refresh_token) 
VALUES ('liisa', 'your_refresh_token_here')
ON CONFLICT (user_id) 
DO UPDATE SET refresh_token = EXCLUDED.refresh_token;
```

### 4. Deploy the Function

```bash
# Deploy to Supabase
supabase functions deploy get-google-calendar-events
```

## Usage

### Request Format

```javascript
const response = await fetch('/functions/v1/get-google-calendar-events', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${supabaseAccessToken}`
  },
  body: JSON.stringify({
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-01-31T23:59:59Z'
  })
})
```

### Response Format

```json
{
  "success": true,
  "bookedSlots": [
    {
      "id": "event_id",
      "title": "Client Meeting",
      "start": "2024-01-15T10:00:00Z",
      "end": "2024-01-15T11:00:00Z",
      "timeZone": "Europe/Helsinki"
    }
  ],
  "totalEvents": 5,
  "bookedCount": 3
}
```

## Error Handling

The function returns appropriate HTTP status codes:

- `400`: Missing startDate or endDate
- `404`: Refresh token not found
- `500`: Google API errors or internal server errors

## Security

- ✅ Uses Supabase service role for database access
- ✅ Validates input parameters
- ✅ Handles CORS properly
- ✅ Includes error logging
- ✅ Uses environment variables for sensitive data

## Testing

Test the function with curl:

```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/get-google-calendar-events' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer your_anon_key' \
  -d '{
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-01-31T23:59:59Z"
  }'
``` 