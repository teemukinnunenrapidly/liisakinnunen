// Supabase client configuration
// This file exports the Supabase client for use in other scripts

// Supabase project credentials
const SUPABASE_URL = 'https://qqbqywurjlnrlsvyuvxf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ZZzKORrf1DSwgKSs8_4ejg_9RBWHKri';

// Create and export the Supabase client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Make it available globally
window.supabaseClient = supabaseClient; 