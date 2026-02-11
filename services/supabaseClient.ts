import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://igfjslukekjsyswgqyww.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_4VlO150U2rSJAg7W0T7DRQ_kphOKFUP';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    return !error;
  } catch (err) {
    return false;
  }
};

/**
 * Profile Sync: Core identity persistence logic.
 * Ensures 'updated_at' is formatted correctly for the Supabase schema.
 */
export const syncProfile = async (email: string, updates: any) => {
  try {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ 
        email, 
        ...updates, 
        updated_at: now 
      }, { onConflict: 'email' })
      .select()
      .single();
    
    if (error) {
      console.error("Supabase Sync Error:", error.message);
      if (error.message.includes('updated_at')) {
        console.error("CRITICAL: Schema cache mismatch. Please run the SQL repair script including 'NOTIFY pgrst, reload schema'.");
      }
      throw error;
    }
    return data;
  } catch (err) {
    console.error("Profile Synchronization Failed:", err);
    throw err;
  }
};

export const getProfile = async (email: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; 
    return data;
  } catch (err) {
    return null;
  }
};

export const createOrderRecord = async (orderData: {
  user_email: string;
  plan_type: string;
  amount: number;
  payment_id: string;
  status: string;
}) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([{
        user_email: orderData.user_email,
        plan_name: orderData.plan_type === 'PRO' ? 'Suraksha Pro' : 'Basic',
        plan_id: orderData.plan_type,
        amount: orderData.amount,
        razorpay_payment_id: orderData.payment_id,
        status: orderData.status,
        currency: 'INR',
        created_at: new Date().toISOString()
      }])
      .select();
    
    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Order Record Persistence Failed:", err);
    throw err;
  }
};

export const createScamReportDb = async (report: any) => {
  try {
    const { data, error } = await supabase
      .from('scam_reports')
      .insert([{
        type: report.type,
        identifier: report.value || report.identifier,
        description: report.description,
        city: report.city || 'Global',
        reports_count: 1,
        risk_score: 80,
        created_at: new Date().toISOString()
      }])
      .select();
    
    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Threat Registry Injection Failed:", err);
    throw err;
  }
};

export const getScamsFromDb = async (query?: string) => {
  try {
    let request = supabase.from('scam_reports').select('*').order('created_at', { ascending: false });
    if (query) {
      request = request.or(`identifier.ilike.%${query}%,city.ilike.%${query}%`);
    }
    const { data, error } = await request.limit(50);
    if (error) throw error;
    return data || [];
  } catch (err) {
    return [];
  }
};