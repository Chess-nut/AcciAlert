import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pyvotjsmkdegnqfbtfbb.supabase.co';
const supabaseAnonKey = 'sb_publishable_XvO8mEH63HQYQz2ekcy3uQ_3ZSoeQq_';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);