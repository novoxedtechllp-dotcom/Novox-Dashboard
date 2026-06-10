import { supabase } from './src/config/supabase.js';

async function check() {
  const { data, error } = await supabase.rpc('get_triggers');
  if (error) {
    console.error('Error fetching triggers:', error);
  } else {
    console.log('Triggers:', data);
  }
}

check();
