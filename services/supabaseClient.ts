import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wtqgpxlabkxxwpzkslqp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0cWdweGxhYmt4eHdwemtzbHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MzU0OTQsImV4cCI6MjA4NTAxMTQ5NH0.7D3_n5fKoRHTkB_JwJoFK1AdHirun0dx7K9zXTndyhU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
