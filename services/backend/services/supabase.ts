import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Context } from 'hono'

class Supabase {
    supabase: SupabaseClient;

    constructor(c: Context<{
        Bindings: CloudflareBindings;
    }>){
        this.supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY);
    }
}

export default Supabase;
