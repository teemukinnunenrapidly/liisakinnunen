// Google Calendar OAuth Handler
class GoogleAuthHandler {
    constructor() {
        this.clientId = '813900383666-cij7uq90b3su6b9bh382ktg869vknfk1.apps.googleusercontent.com'
        this.redirectUri = window.location.origin + '/google-auth.html'
        this.scope = 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.profile'
        
        this.connectBtn = document.getElementById('connect-calendar-btn')
        this.disconnectBtn = document.getElementById('disconnect-calendar-btn')
        this.statusIndicator = document.getElementById('status-indicator')
        this.statusDescription = document.getElementById('status-description')
        
        this.initializeEventListeners()
        this.checkAuthStatus()
    }

    initializeEventListeners() {
        this.connectBtn.addEventListener('click', () => {
            this.initiateGoogleAuth()
        })

        this.disconnectBtn.addEventListener('click', () => {
            this.disconnectCalendar()
        })
    }

    async checkAuthStatus() {
        try {
            // Check if we have a refresh token stored
            const { data, error } = await window.supabaseClient
                .from('google_auth')
                .select('refresh_token')
                .eq('user_id', 'liisa')
                .single()

            if (data && data.refresh_token) {
                this.updateStatus('connected', 'Kalenteri on yhdistetty')
                this.showConnectedState()
            } else {
                this.updateStatus('disconnected', 'Kalenteri ei ole yhdistetty')
                this.showDisconnectedState()
            }
        } catch (error) {
            console.error('Error checking auth status:', error)
            this.updateStatus('error', 'Virhe tilan tarkistuksessa')
        }
    }

    initiateGoogleAuth() {
        // Build Google OAuth URL
        const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
        authUrl.searchParams.set('client_id', this.clientId)
        authUrl.searchParams.set('redirect_uri', this.redirectUri)
        authUrl.searchParams.set('response_type', 'code')
        authUrl.searchParams.set('scope', this.scope)
        authUrl.searchParams.set('access_type', 'offline')
        authUrl.searchParams.set('prompt', 'consent')
        authUrl.searchParams.set('state', this.generateState())

        // Store state for verification
        localStorage.setItem('google_auth_state', authUrl.searchParams.get('state'))

        // Redirect to Google OAuth
        window.location.href = authUrl.toString()
    }

    generateState() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    }

    async handleAuthCallback() {
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const state = urlParams.get('state')
        const error = urlParams.get('error')

        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname)

        if (error) {
            this.updateStatus('error', `Virhe yhdistämisessä: ${error}`)
            return
        }

        if (!code || !state) {
            return
        }

        // Verify state
        const storedState = localStorage.getItem('google_auth_state')
        if (state !== storedState) {
            this.updateStatus('error', 'Virheellinen valtuutus')
            return
        }

        localStorage.removeItem('google_auth_state')

        try {
            this.updateStatus('loading', 'Yhdistetään kalenteria...')

            // Exchange code for tokens
            const tokenResponse = await fetch('/functions/v1/exchange-google-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: code,
                    redirectUri: this.redirectUri
                })
            })

            if (!tokenResponse.ok) {
                throw new Error('Failed to exchange code for tokens')
            }

            const tokenData = await tokenResponse.json()

            if (tokenData.success) {
                // Store refresh token in Supabase
                const { error: dbError } = await window.supabaseClient
                    .from('google_auth')
                    .upsert({
                        user_id: 'liisa',
                        refresh_token: tokenData.refresh_token,
                        created_at: new Date().toISOString()
                    })

                if (dbError) {
                    throw new Error('Failed to store refresh token')
                }

                this.updateStatus('connected', 'Kalenteri yhdistetty onnistuneesti!')
                this.showConnectedState()
                
                // Show success message
                setTimeout(() => {
                    alert('Google Kalenteri yhdistetty onnistuneesti! Nyt voit käyttää ajanvarausjärjestelmää.')
                }, 1000)

            } else {
                throw new Error(tokenData.error || 'Failed to complete authentication')
            }

        } catch (error) {
            console.error('Auth error:', error)
            this.updateStatus('error', `Virhe yhdistämisessä: ${error.message}`)
        }
    }

    async disconnectCalendar() {
        if (confirm('Haluatko varmasti poistaa Google Kalenterin yhdistämisen?')) {
            try {
                // Remove from database
                const { error } = await window.supabaseClient
                    .from('google_auth')
                    .delete()
                    .eq('user_id', 'liisa')

                if (error) {
                    throw new Error('Failed to disconnect calendar')
                }

                this.updateStatus('disconnected', 'Yhteys poistettu')
                this.showDisconnectedState()

            } catch (error) {
                console.error('Disconnect error:', error)
                this.updateStatus('error', 'Virhe yhteyden poistamisessa')
            }
        }
    }

    updateStatus(status, message) {
        const statusDot = this.statusIndicator.querySelector('.status-dot')
        const statusText = this.statusIndicator.querySelector('.status-text')

        // Remove all status classes
        statusDot.className = 'status-dot'
        statusText.textContent = message

        // Add appropriate status class
        switch (status) {
            case 'connected':
                statusDot.classList.add('connected')
                break
            case 'disconnected':
                statusDot.classList.add('disconnected')
                break
            case 'loading':
                statusDot.classList.add('loading')
                break
            case 'error':
                statusDot.classList.add('error')
                break
        }

        this.statusDescription.textContent = this.getStatusDescription(status)
    }

    getStatusDescription(status) {
        switch (status) {
            case 'connected':
                return 'Kalenteri on yhdistetty ja ajanvarausjärjestelmä on käytössä.'
            case 'disconnected':
                return 'Kalenteri ei ole yhdistetty. Klikkaa "Yhdistä Google Kalenteri" -nappia aloittaaksesi.'
            case 'loading':
                return 'Yhdistetään kalenteria... Odota hetki.'
            case 'error':
                return 'Virhe yhdistämisessä. Yritä uudelleen.'
            default:
                return ''
        }
    }

    showConnectedState() {
        this.connectBtn.style.display = 'none'
        this.disconnectBtn.style.display = 'inline-flex'
    }

    showDisconnectedState() {
        this.connectBtn.style.display = 'inline-flex'
        this.disconnectBtn.style.display = 'none'
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const authHandler = new GoogleAuthHandler()
    
    // Check if this is an OAuth callback
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('code')) {
        authHandler.handleAuthCallback()
    }
}) 