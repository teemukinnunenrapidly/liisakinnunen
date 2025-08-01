# Exchange Google Code - Supabase Edge Function

This Edge Function handles the OAuth code exchange process for Google Calendar integration.

## Purpose

This function exchanges the authorization code received from Google OAuth for access and refresh tokens, which are then stored in the `google_auth` table for future use.

## Setup Instructions

### 1. Google Cloud Console Setup

1. **Create a Google Cloud Project** (if you haven't already)
2. **Enable Google Calendar API**:
   - Go to APIs & Services > Library
   - Search for "Google Calendar API"
   - Click "Enable"

3. **Create OAuth 2.0 Credentials**:
   - Go to APIs & Services > Credentials
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `https://your-project.supabase.co/functions/v1/exchange-google-code`
     - `http://localhost:54321/functions/v1/exchange-google-code` (for local development)

4. **Configure OAuth Consent Screen**:
   - Go to APIs & Services > OAuth consent screen
   - Add scopes:
     - `https://www.googleapis.com/auth/calendar.events`
     - `https://www.googleapis.com/auth/calendar`
     - `https://www.googleapis.com/auth/userinfo.profile`

### 2. Environment Variables

Set these in your Supabase project:

```bash
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 3. Deploy the Function

```bash
supabase functions deploy exchange-google-code
```

## OAuth Flow

1. **User clicks "Yhdistä Google Kalenteri"** on `google-auth.html`
2. **Redirect to Google OAuth** with authorization request
3. **User consents** to calendar permissions
4. **Google redirects back** with authorization code
5. **Frontend calls this function** with the code
6. **Function exchanges code** for refresh token
7. **Refresh token stored** in `google_auth` table

## Request Format

```javascript
const response = await fetch('/functions/v1/exchange-google-code', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    code: 'authorization_code_from_google',
    redirectUri: 'https://your-domain.com/google-auth.html'
  })
})
```

## Response Format

```json
{
  "success": true,
  "refresh_token": "1//04dX...",
  "access_token": "ya29.a0AfH6SMC...",
  "expires_in": 3599,
  "scope": "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.profile"
}
```

## Error Handling

The function returns appropriate HTTP status codes:

- `400`: Missing required parameters or no refresh token received
- `500`: Google API errors or internal server errors

## Security Features

- ✅ **State verification**: Prevents CSRF attacks
- ✅ **Secure token storage**: Refresh tokens stored in Supabase
- ✅ **Environment variables**: Sensitive credentials not in code
- ✅ **CORS headers**: Proper cross-origin handling

## Testing

Test the complete OAuth flow:

1. **Deploy the function**
2. **Update `google-auth.js`** with your Client ID
3. **Visit `google-auth.html`**
4. **Click "Yhdistä Google Kalenteri"**
5. **Complete OAuth flow**
6. **Verify token storage** in Supabase

## Troubleshooting

### Common Issues:

1. **"No refresh token received"**:
   - Ensure `access_type=offline` in OAuth request
   - Add `prompt=consent` to force consent screen

2. **"Invalid redirect URI"**:
   - Check redirect URI in Google Cloud Console
   - Ensure exact match with OAuth request

3. **"Unauthorized"**:
   - Verify Client ID and Secret in environment variables
   - Check API enablement in Google Cloud Console

### Debug Steps:

1. **Check function logs**:
   ```bash
   supabase functions logs exchange-google-code
   ```

2. **Verify environment variables**:
   ```bash
   supabase secrets list
   ```

3. **Test with curl**:
   ```bash
   curl -X POST 'https://your-project.supabase.co/functions/v1/exchange-google-code' \
     -H 'Content-Type: application/json' \
     -d '{"code":"test","redirectUri":"https://example.com"}'
   ``` 