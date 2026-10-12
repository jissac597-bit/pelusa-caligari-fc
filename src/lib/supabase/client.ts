import { createClient } from '@supabase/supabase-js';

// Usamos la variable de entorno, y si Vercel falla al leerla, usamos el texto directo como respaldo.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ziyqtandzzbsoenxajfo.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppeXF0YW5kenpic29lbnhhamZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE3NjM3NTQsImV4cCI6MjEwNzMzOTc1NH0.6RgjeMB9j-_88UGbIc7CJDJ6b9OzgdHRpNAGb3x90gY';

export const supabase = createClient(supabaseUrl, supabaseKey); 