import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mmabieijkhcylcziveks.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tYWJpZWlqa2hjeWxjeml2ZWtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3Mjk3NDAsImV4cCI6MjA5MjMwNTc0MH0.liTitieXK-RJ8E7AsGwmMzaSu7Rui2HCM5T9v8GY2WE';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});
