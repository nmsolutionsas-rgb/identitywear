import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wtzqownjoaaapkhuzfxf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0enFvd25qb2FhYXBraHV6ZnhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MTQ0NTUsImV4cCI6MjA4MTM5MDQ1NX0.csoWbomoD5JAT366R3ak6mA2gYQiH65jK3jmETuYgkM';

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
