// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wwiyetwzzkvuynizijpm.supabase.co';
const supabaseAnonKey = 'sb_publishable_Wi3ffZgiGz0Ioc3ocSlOww_Ii8AiHsG';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);