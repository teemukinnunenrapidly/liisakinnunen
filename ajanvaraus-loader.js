// Appointment Booking System
class AppointmentLoader {
    constructor() {
        this.currentWeek = new Date()
        this.scheduleGrid = document.getElementById('schedule-grid')
        this.suggestedTimes = document.getElementById('suggested-times')
        
        this.initializeEventListeners()
        this.loadCurrentWeek()
    }

    initializeEventListeners() {
        // Week navigation
        document.getElementById('prev-week').addEventListener('click', () => {
            this.navigateWeek(-1)
        })
        
        document.getElementById('next-week').addEventListener('click', () => {
            this.navigateWeek(1)
        })

        // Booking form
        document.getElementById('booking-form').addEventListener('submit', (e) => {
            e.preventDefault()
            this.handleBooking()
        })

        document.getElementById('cancel-booking').addEventListener('click', () => {
            this.hideBookingForm()
        })

        // Suggested times buttons
        document.querySelectorAll('.select-time-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const day = e.target.dataset.day
                this.selectSuggestedTime(day)
            })
        })

        // View toggle
        document.getElementById('show-full-calendar').addEventListener('click', () => {
            this.toggleView()
        })
    }

    navigateWeek(direction) {
        this.currentWeek.setDate(this.currentWeek.getDate() + (direction * 7))
        this.loadCurrentWeek()
    }

    loadCurrentWeek() {
        this.updateWeekDisplay()
        this.loadSchedule()
    }

    updateWeekDisplay() {
        const startOfWeek = this.getStartOfWeek(this.currentWeek)
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(endOfWeek.getDate() + 6)
        
        const options = { day: 'numeric', month: 'long', year: 'numeric' }
        const startStr = startOfWeek.toLocaleDateString('fi-FI', options)
        const endStr = endOfWeek.toLocaleDateString('fi-FI', options)
        
        this.weekNavigator.innerHTML = `<h2>${startStr} - ${endStr}</h2>`
    }

    getStartOfWeek(date) {
        const d = new Date(date)
        const day = d.getDay()
        const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust for Sunday
        return new Date(d.setDate(diff))
    }

    async loadSchedule() {
        try {
            this.showLoading()
            
            // Get start and end of current week
            const startOfWeek = this.getStartOfWeek(this.currentWeek)
            const endOfWeek = new Date(startOfWeek)
            endOfWeek.setDate(endOfWeek.getDate() + 7)
            
            // Format dates for API
            const startDate = startOfWeek.toISOString()
            const endDate = endOfWeek.toISOString()
            
            // Fetch booked times from Supabase Edge Function
            const response = await fetch('https://qqbqywurjlnrlsvyuvxf.supabase.co/functions/v1/get-google-calendar-events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxYnF5d3Vyamxucmxzdnl1dnhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMzkzOTgsImV4cCI6MjA2OTYxNTM5OH0.9nlkXt3Sn9ET8SsZImmQeekYKxFRGxCo3ofUPmWuwew'
                },
                body: JSON.stringify({
                    startDate: startDate,
                    endDate: endDate
                })
            })

            if (!response.ok) {
                throw new Error('Failed to fetch calendar events')
            }

            const data = await response.json()
            
            if (data.success) {
                this.renderSchedule(startOfWeek, data.bookedSlots)
            } else {
                throw new Error(data.error || 'Failed to load schedule')
            }

        } catch (error) {
            console.error('Error loading schedule:', error)
            this.showError('Virhe aikataulun lataamisessa. Yritä uudelleen.')
        }
    }

    renderSchedule(startOfWeek, bookedSlots) {
        this.scheduleGrid.innerHTML = ''
        
        // Create week grid
        const weekDays = ['Maanantai', 'Tiistai', 'Keskiviikko', 'Torstai', 'Perjantai', 'Lauantai', 'Sunnuntai']
        const timeSlots = this.generateTimeSlots()
        
        // Create header row
        const headerRow = document.createElement('div')
        headerRow.className = 'schedule-header'
        headerRow.innerHTML = '<div class="time-column">Aika</div>'
        
        for (let i = 0; i < 7; i++) {
            const dayDate = new Date(startOfWeek)
            dayDate.setDate(dayDate.getDate() + i)
            
            const dayName = weekDays[i]
            const dayNumber = dayDate.getDate()
            const monthName = dayDate.toLocaleDateString('fi-FI', { month: 'short' })
            
            headerRow.innerHTML += `
                <div class="day-column">
                    <div class="day-name">${dayName}</div>
                    <div class="day-date">${dayNumber}. ${monthName}</div>
                </div>
            `
        }
        this.scheduleGrid.appendChild(headerRow)
        
        // Create time slot rows
        timeSlots.forEach(timeSlot => {
            const row = document.createElement('div')
            row.className = 'schedule-row'
            row.innerHTML = `<div class="time-column">${timeSlot}</div>`
            
            for (let i = 0; i < 7; i++) {
                const dayDate = new Date(startOfWeek)
                dayDate.setDate(dayDate.getDate() + i)
                
                const slotDateTime = this.createSlotDateTime(dayDate, timeSlot)
                const isBooked = this.isSlotBooked(slotDateTime, bookedSlots)
                const isPast = this.isSlotInPast(slotDateTime)
                const isWeekend = dayDate.getDay() === 0 || dayDate.getDay() === 6 // Sunday = 0, Saturday = 6
                
                let slotClass = 'time-slot'
                let slotContent = ''
                
                if (isPast) {
                    slotClass += ' past'
                    slotContent = 'Menneisyys'
                } else if (isWeekend) {
                    slotClass += ' weekend'
                    slotContent = 'Suljettu'
                } else if (isBooked) {
                    slotClass += ' booked'
                    slotContent = 'Varattu'
                } else {
                    slotClass += ' available'
                    slotContent = 'Vapaa'
                    
                    // Add click event for available slots
                    const slotElement = document.createElement('div')
                    slotElement.className = slotClass
                    slotElement.textContent = slotContent
                    slotElement.addEventListener('click', () => {
                        this.selectTimeSlot(slotDateTime, timeSlot, dayDate)
                    })
                    row.appendChild(slotElement)
                    continue
                }
                
                row.innerHTML += `<div class="${slotClass}">${slotContent}</div>`
            }
            
            this.scheduleGrid.appendChild(row)
        })

        // Render mobile calendar
        this.renderMobileCalendar(startOfWeek, bookedSlots)
        
        // Find and display suggested times
        const suggestedSlots = this.findSuggestedTimes(startOfWeek, bookedSlots)
        this.updateSuggestedTimesDisplay(suggestedSlots)
    }

    findSuggestedTimes(startOfWeek, bookedSlots) {
        const suggestedSlots = {}
        const weekDays = ['monday', 'tuesday', 'wednesday']
        const dayIndices = [1, 2, 3] // Monday, Tuesday, Wednesday
        
        dayIndices.forEach((dayIndex, i) => {
            const dayName = weekDays[i]
            const dayDate = new Date(startOfWeek)
            dayDate.setDate(dayDate.getDate() + dayIndex)
            
            const timeSlots = this.generateTimeSlots()
            let foundSlot = null
            
            for (const timeSlot of timeSlots) {
                const slotDateTime = this.createSlotDateTime(dayDate, timeSlot)
                
                if (!this.isSlotBooked(slotDateTime, bookedSlots) && 
                    !this.isSlotInPast(slotDateTime)) {
                    foundSlot = {
                        time: timeSlot,
                        date: `${dayDate.toLocaleDateString('fi-FI', { 
                            weekday: 'long',
                            day: 'numeric',
                            month: 'short'
                        })}`,
                        dateTime: slotDateTime
                    }
                    break
                }
            }
            
            suggestedSlots[dayName] = foundSlot
        })
        
        return suggestedSlots
    }

    updateSuggestedTimesDisplay(suggestedSlots) {
        const days = ['monday', 'tuesday', 'wednesday']
        
        days.forEach(day => {
            const timeElement = document.getElementById(`${day}-time`)
            const dateElement = document.getElementById(`${day}-date`)
            const card = document.getElementById(`${day}-card`)
            const button = card.querySelector('.select-time-btn')
            
            if (suggestedSlots[day]) {
                const slot = suggestedSlots[day]
                timeElement.textContent = slot.time
                dateElement.textContent = slot.date
                button.disabled = false
                card.style.opacity = '1'
            } else {
                timeElement.textContent = '-'
                dateElement.textContent = '-'
                button.disabled = true
                card.style.opacity = '0.5'
            }
        })
    }

    renderMobileCalendar(startOfWeek, bookedSlots) {
        const mobileDaySelect = document.getElementById('mobile-day-select')
        const mobileTimeSlots = document.getElementById('mobile-time-slots')
        
        if (!mobileDaySelect || !mobileTimeSlots) return
        
        // Clear existing content
        mobileDaySelect.innerHTML = '<option value="">Valitse päivä</option>'
        mobileTimeSlots.innerHTML = ''
        
        const weekDays = ['Maanantai', 'Tiistai', 'Keskiviikko', 'Torstai', 'Perjantai', 'Lauantai', 'Sunnuntai']
        const timeSlots = this.generateTimeSlots()
        
        // Create day options
        for (let i = 0; i < 7; i++) {
            const dayDate = new Date(startOfWeek)
            dayDate.setDate(dayDate.getDate() + i)
            
            const dayName = weekDays[i]
            const dayNumber = dayDate.getDate()
            const monthName = dayDate.toLocaleDateString('fi-FI', { month: 'short' })
            const dateString = dayDate.toISOString().split('T')[0]
            
            const option = document.createElement('option')
            option.value = dateString
            option.textContent = `${dayName} ${dayNumber}. ${monthName}`
            mobileDaySelect.appendChild(option)
        }
        
        // Add event listener for day selection
        mobileDaySelect.addEventListener('change', (e) => {
            const selectedDate = e.target.value
            if (selectedDate) {
                this.renderMobileTimeSlots(new Date(selectedDate), bookedSlots)
            } else {
                mobileTimeSlots.innerHTML = ''
            }
        })
    }

    renderMobileTimeSlots(selectedDate, bookedSlots) {
        const mobileTimeSlots = document.getElementById('mobile-time-slots')
        if (!mobileTimeSlots) return
        
        mobileTimeSlots.innerHTML = ''
        const timeSlots = this.generateTimeSlots()
        
        timeSlots.forEach(timeSlot => {
            const slotDateTime = this.createSlotDateTime(selectedDate, timeSlot)
            const isBooked = this.isSlotBooked(slotDateTime, bookedSlots)
            const isPast = this.isSlotInPast(slotDateTime)
            const isWeekend = selectedDate.getDay() === 0 || selectedDate.getDay() === 6
            
            let slotClass = 'mobile-time-slot'
            let status = ''
            
            if (isPast) {
                slotClass += ' past'
                status = 'Menneisyys'
            } else if (isWeekend) {
                slotClass += ' weekend'
                status = 'Suljettu'
            } else if (isBooked) {
                slotClass += ' booked'
                status = 'Varattu'
            } else {
                slotClass += ' available'
                status = 'Vapaa'
            }
            
            const slotElement = document.createElement('div')
            slotElement.className = slotClass
            slotElement.innerHTML = `
                <span class="time">${timeSlot}</span>
                <span class="status">${status}</span>
            `
            
            // Add click event for available slots
            if (!isPast && !isWeekend && !isBooked) {
                slotElement.addEventListener('click', () => {
                    this.selectTimeSlot(slotDateTime, timeSlot, selectedDate)
                })
            }
            
            mobileTimeSlots.appendChild(slotElement)
        })
    }

    generateTimeSlots() {
        const slots = []
        for (let hour = 9; hour <= 16; hour++) { // 9:00 - 17:00
            slots.push(`${hour.toString().padStart(2, '0')}:00`)
        }
        return slots
    }

    createSlotDateTime(date, timeSlot) {
        const [hours, minutes] = timeSlot.split(':').map(Number)
        const slotDate = new Date(date)
        slotDate.setHours(hours, minutes, 0, 0)
        return slotDate
    }

    isSlotBooked(slotDateTime, bookedSlots) {
        const slotEnd = new Date(slotDateTime)
        slotEnd.setHours(slotEnd.getHours() + 1)
        
        return bookedSlots.some(bookedSlot => {
            const bookedStart = new Date(bookedSlot.start)
            const bookedEnd = new Date(bookedSlot.end)
            
            // Check if there's any overlap
            return (slotDateTime < bookedEnd && slotEnd > bookedStart)
        })
    }

    isSlotInPast(slotDateTime) {
        return slotDateTime <= new Date()
    }

    selectTimeSlot(slotDateTime, timeSlot, dayDate) {
        this.selectedTimeSlot = {
            dateTime: slotDateTime,
            timeSlot: timeSlot,
            dayDate: dayDate
        }
        
        // Update selected time summary
        this.updateSelectedTimeSummary()
        
        this.showBookingForm()
    }

    updateSelectedTimeSummary() {
        const summaryElement = document.getElementById('selected-time-summary')
        if (!summaryElement || !this.selectedTimeSlot) return
        
        const { dateTime, timeSlot, dayDate } = this.selectedTimeSlot
        
        // Format date
        const dateStr = dayDate.toLocaleDateString('fi-FI', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long',
            year: 'numeric'
        })
        
        // Calculate end time
        const startTime = new Date(dateTime)
        const endTime = new Date(startTime)
        endTime.setHours(endTime.getHours() + 1)
        
        const startTimeStr = startTime.toLocaleTimeString('fi-FI', { 
            hour: '2-digit', 
            minute: '2-digit' 
        })
        const endTimeStr = endTime.toLocaleTimeString('fi-FI', { 
            hour: '2-digit', 
            minute: '2-digit' 
        })
        
        summaryElement.innerHTML = `
            <div class="date-time">${dateStr}</div>
            <div class="duration">${startTimeStr} - ${endTimeStr}</div>
            <div class="price">Hinta: 70€</div>
        `
    }

    showBookingForm() {
        const formContainer = document.getElementById('booking-form-container')
        const serviceSelect = document.getElementById('service-type')
        
        // Pre-select the chosen service if available
        if (this.selectedService && serviceSelect) {
            serviceSelect.value = this.selectedService
        }
        
        formContainer.style.display = 'block'
        formContainer.scrollIntoView({ behavior: 'smooth' })
    }

    hideBookingForm() {
        this.bookingForm.style.display = 'none'
        this.selectedTimeSlot = null
    }

    getEndTime(startTime) {
        const [hours, minutes] = startTime.split(':').map(Number)
        const endHour = hours + 1
        return `${endHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    }

    async handleBooking() {
        if (!this.selectedTimeSlot) {
            alert('Valitse ensin aika')
            return
        }

        const formData = new FormData(document.getElementById('booking-form'))
        const bookingData = {
            clientName: formData.get('clientName'),
            clientEmail: formData.get('clientEmail'),
            clientPhone: formData.get('clientPhone'),
            serviceType: formData.get('serviceType'),
            notes: formData.get('notes'),
            startTime: this.selectedTimeSlot.dateTime.toISOString(),
            endTime: new Date(this.selectedTimeSlot.dateTime.getTime() + 60 * 60 * 1000).toISOString() // +1 hour
        }

        try {
            // Create calendar event
            const response = await fetch('https://qqbqywurjlnrlsvyuvxf.supabase.co/functions/v1/create-google-calendar-event', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxYnF5d3Vyamxucmxzdnl1dnhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMzkzOTgsImV4cCI6MjA2OTYxNTM5OH0.9nlkXt3Sn9ET8SsZImmQeekYKxFRGxCo3ofUPmWuwew'
                },
                body: JSON.stringify(bookingData)
            })

            const result = await response.json()

            if (result.success) {
                alert(`Ajanvaraus onnistui! Tarkista sähköpostisi vahvistusta varten.\n\nTapahtuman linkki: ${result.eventLink}`)
                this.hideBookingForm()
                document.getElementById('booking-form').reset()
                this.loadCurrentWeek() // Refresh schedule
            } else {
                throw new Error(result.error || 'Ajanvaraus epäonnistui')
            }

        } catch (error) {
            console.error('Booking error:', error)
            alert(`Virhe ajanvarauksessa: ${error.message}`)
        }
    }

    showLoading() {
        this.scheduleGrid.innerHTML = `
            <div class="loading">
                <p>Ladataan aikataulua...</p>
            </div>
        `
    }

    showError(message) {
        this.scheduleGrid.innerHTML = `
            <div class="error">
                <p>${message}</p>
                <button onclick="location.reload()">Yritä uudelleen</button>
            </div>
        `
    }

    toggleView() {
        const suggestedTimes = document.getElementById('suggested-times')
        const scheduleGrid = document.getElementById('schedule-grid')
        const mobileCalendar = document.querySelector('.mobile-calendar')
        const toggleBtn = document.getElementById('show-full-calendar')
        
        if (suggestedTimes.style.display === 'none') {
            // Show suggested times
            suggestedTimes.style.display = 'block'
            scheduleGrid.style.display = 'none'
            mobileCalendar.style.display = 'none'
            toggleBtn.textContent = 'Näytä koko kalenteri'
        } else {
            // Show full calendar
            suggestedTimes.style.display = 'none'
            scheduleGrid.style.display = 'block'
            mobileCalendar.style.display = 'block'
            toggleBtn.textContent = 'Näytä ehdotetut ajat'
        }
    }

    selectSuggestedTime(day) {
        const timeElement = document.getElementById(`${day}-time`)
        const dateElement = document.getElementById(`${day}-date`)
        const serviceDropdown = document.getElementById(`${day}-service`)
        
        if (timeElement && dateElement && timeElement.textContent !== '-') {
            // Check if service is selected
            const selectedService = serviceDropdown.value
            if (!selectedService) {
                alert('Valitse ensin palvelu')
                return
            }
            
            const time = timeElement.textContent
            const date = dateElement.textContent
            
            // Parse the date and time
            const [dayName, dayNumber, month] = date.split(' ')
            const currentYear = new Date().getFullYear()
            const dateString = `${dayNumber}.${month}.${currentYear}`
            
            // Create a proper date object
            const selectedDate = new Date(dateString)
            const [hours, minutes] = time.split(':').map(Number)
            selectedDate.setHours(hours, minutes, 0, 0)
            
            // Store selected service
            this.selectedService = selectedService
            
            this.selectTimeSlot(selectedDate, time, selectedDate)
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('aikataulu-grid')) {
        new AppointmentLoader()
    }
}) 