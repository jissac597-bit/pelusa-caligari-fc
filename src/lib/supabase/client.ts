import { createClient } from '@supabase/supabase-js';

// Eliminamos process.env por completo para evitar que Vercel inyecte errores
const supabaseUrl = 'https://ziyqtandzzbsoenxajfo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppeXF0YW5kenpic29lbnhhamZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE3NjM3NTQsImV4cCI6MjEwNzMzOTc1NH0.6RgjeMB9j-_88UGbIc7CJDJ6b9OzgdHRpNAGb3x90gY'; 

export const supabase = createClient(supabaseUrl, supabaseKey);