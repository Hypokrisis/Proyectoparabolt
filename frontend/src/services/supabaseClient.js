import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wsstkdkypzjzmewxvtig.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indzc3RrZGt5cHpqem1ld3h2dGlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2OTkyMjAsImV4cCI6MjA2NjI3NTIyMH0.clV6NyuHjGJltu88QgAjkeJZ_76l97TIRhjgtLVIxSE';

export const supabase = createClient(supabaseUrl, supabaseKey);