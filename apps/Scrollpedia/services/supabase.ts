import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl: string = process.env.EXPO_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey: string = process.env.EXPO_PUBLIC_SUPABASE_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})