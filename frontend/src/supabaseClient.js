import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ehnketngffiufpnwrgfa.supabase.co'; // 🔹 Troque pelo seu URL do Supabase
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVobmtldG5nZmZpdWZwbndyZ2ZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4NDE0MjIsImV4cCI6MjA1NjQxNzQyMn0.Eo1kX5fG-0_uDfyhvMSUK8YGmcZcYbiUA5cLoVOh0MY'; // 🔹 Troque pela sua chave ANON

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;
