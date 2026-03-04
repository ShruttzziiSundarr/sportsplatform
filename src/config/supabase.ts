import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// 1. Force dotenv to look exactly two folders up (from src/config to the root)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// 2. Hard stop: If it STILL can't find them, crash gracefully with a clear message
if (!supabaseUrl || !supabaseKey) {
  console.error(`
    ❌ CRITICAL ERROR: Cannot find Supabase credentials!
    Looking for .env file at: ${path.resolve(__dirname, '../../.env')}
  `);
  process.exit(1); // Kill the server so we don't get messy Supabase errors
}

// 3. Export the connected client
export const supabase = createClient(supabaseUrl, supabaseKey);