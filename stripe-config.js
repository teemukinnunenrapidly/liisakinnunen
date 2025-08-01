// Stripe configuration
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51RrKi2BpSsJAelSjusF2naQOpdkb1Ci20a0KBB247oyrBxpyOnLKUwFPFJz5HwyTu4669yjQT1p0jpWn1zRphvx200NlDHF6Zb';

// Initialize Stripe
const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);

// Product configurations
const PRODUCTS = {
    'äitiysfysioterapia-luento': {
        name: 'Äitiysfysioterapia - perusteet',
        price: 5000, // 50€ in cents
        currency: 'eur'
    },
    'lantionpohjalihasten-koulutus': {
        name: 'Lantionpohjalihasten harjoittelu',
        price: 15000, // 150€ in cents
        currency: 'eur'
    },
    'psykofyysinen-fysioterapia': {
        name: 'Psykofyysinen fysioterapia',
        price: 8000, // 80€ in cents
        currency: 'eur'
    }
};

// Export for use in other files
window.stripeConfig = {
    stripe,
    PRODUCTS
}; 