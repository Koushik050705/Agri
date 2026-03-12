import { createClient } from '@supabase/supabase-js';

// These should be configured in your .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zzvgqbokcfmnbmnhubip.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6dmdxYm9rY2ZtbmJtbmh1YmlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDYzNDcsImV4cCI6MjA4ODcyMjM0N30.JxsYN4mzr7OlZ2vObBQuSbZeSSqoUR63W_FNc8CH32k';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
