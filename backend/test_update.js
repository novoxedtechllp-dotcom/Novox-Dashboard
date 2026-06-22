import { supabase } from './src/config/supabase.js';

async function test() {
  const { data, error } = await supabase
    .from('leads')
    .update({ stage: 'ADMISSION' })
    .eq('id', '9d4350b9-46d3-4b1d-8f14-362d2b6c1bbe')
    .select()
    .single();
    
  console.log('Error:', error);
  console.log('Data:', data);
}

test();
