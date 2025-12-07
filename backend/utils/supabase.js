const { createClient } = require('@supabase/supabase-js');

// Make Supabase optional - backend can work without it (will just skip database operations)
let supabase = null;

if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
  console.log('✅ Supabase connected');
} else {
  console.warn('⚠️  Supabase not configured - database features will be disabled');
}

module.exports = supabase;

