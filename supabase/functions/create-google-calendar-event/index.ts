import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateEventRequest {
  clientName: string
  clientEmail: string
  startTime: string
  endTime: string
  serviceType: string
  notes?: string
}

interface GoogleAuthResponse {
  access_token: string
  token_type: string
  expires_in: number
}

interface CalendarEventResponse {
  id: string
  htmlLink: string
  summary: string
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request body
    const { clientName, clientEmail, startTime, endTime, serviceType, notes }: CreateEventRequest = await req.json()

    // Validate required fields
    if (!clientName || !clientEmail || !startTime || !endTime || !serviceType) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: clientName, clientEmail, startTime, endTime, serviceType' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(clientEmail)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate date format and logic
    const start = new Date(startTime)
    const end = new Date(endTime)
    const now = new Date()

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return new Response(
        JSON.stringify({ error: 'Invalid date format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (start <= now) {
      return new Response(
        JSON.stringify({ error: 'Start time must be in the future' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (end <= start) {
      return new Response(
        JSON.stringify({ error: 'End time must be after start time' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get Liisa's refresh token from google_auth table
    const { data: authData, error: authError } = await supabase
      .from('google_auth')
      .select('refresh_token')
      .eq('user_id', 'liisa')
      .single()

    if (authError || !authData?.refresh_token) {
      return new Response(
        JSON.stringify({ error: 'Refresh token not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Google OAuth configuration
    const clientId = Deno.env.get('GOOGLE_CLIENT_ID')!
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')!
    const refreshToken = authData.refresh_token

    // Exchange refresh token for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    })

    if (!tokenResponse.ok) {
      return new Response(
        JSON.stringify({ error: 'Failed to get access token' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const tokenData: GoogleAuthResponse = await tokenResponse.json()

    // Create calendar event
    const eventData = {
      summary: `${serviceType} - ${clientName}`,
      description: `Asiakas: ${clientName}\nSähköposti: ${clientEmail}\nPalvelu: ${serviceType}${notes ? `\nLisätiedot: ${notes}` : ''}`,
      start: {
        dateTime: startTime,
        timeZone: 'Europe/Helsinki',
      },
      end: {
        dateTime: endTime,
        timeZone: 'Europe/Helsinki',
      },
      attendees: [
        { email: clientEmail, displayName: clientName },
        { email: 'liisa@liisakinnunen.fi', displayName: 'Liisa Kinnunen' }
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 24 hours before
          { method: 'popup', minutes: 30 }, // 30 minutes before
        ],
      },
    }

    const calendarResponse = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      }
    )

    if (!calendarResponse.ok) {
      const errorData = await calendarResponse.text()
      console.error('Google Calendar API error:', errorData)
      return new Response(
        JSON.stringify({ error: 'Failed to create calendar event' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const createdEvent: CalendarEventResponse = await calendarResponse.json()

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Calendar event created successfully',
        eventId: createdEvent.id,
        eventLink: createdEvent.htmlLink,
        summary: createdEvent.summary,
        startTime: createdEvent.start.dateTime,
        endTime: createdEvent.end.dateTime,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in create-google-calendar-event:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 