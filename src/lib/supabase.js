import { createClient } from '@supabase/supabase-js';

// These should be configured in your .env file
const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabaseUrl = (envUrl && envUrl !== 'YOUR_SUPABASE_URL') ? envUrl : 'https://zzvgqbokcfmnbmnhubip.supabase.co';
const supabaseAnonKey = (envKey && envKey !== 'YOUR_SUPABASE_ANON_KEY') ? envKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6dmdxYm9rY2ZtbmJtbmh1YmlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDYzNDcsImV4cCI6MjA4ODcyMjM0N30.JxsYN4mzr7OlZ2vObBQuSbZeSSqoUR63W_FNc8CH32k';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
