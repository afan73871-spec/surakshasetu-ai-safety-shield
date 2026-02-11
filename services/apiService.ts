import { supabase, syncProfile, getProfile, getScamsFromDb, createScamReportDb } from './supabaseClient';
// Added SupportRequest to the types import
import { VerificationRequest, FamilyMemberStatus, SupportRequest } from '../types';

const HEALTH_URL = '/api/health';

export const apiClient = {
  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(HEALTH_URL, { signal: AbortSignal.timeout(1000) });
      const data = await response.json();
      return data.status === 'LIVE';
    } catch {
      return false;
    }
  },

  /**
   * SUPPORT DESK API
   */
  // Added submitSupportRequest to handle user support tickets
  async submitSupportRequest(data: { email: string; name: string; subject: string; message: string }): Promise<{ success: boolean; token?: string; message?: string }> {
    try {
      const token = `SS-PRM-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      const { error } = await supabase
        .from('support_requests')
        .insert([{
          user_email: data.email,
          user_name: data.name,
          subject: data.subject,
          message: data.message,
          token_id: token,
          status: 'PENDING'
        }]);
      
      if (error) throw error;
      return { success: true, token };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  },

  // Added getSupportRequests for the Admin Panel view
  async getSupportRequests(): Promise<SupportRequest[]> {
    try {
      const { data, error } = await supabase
        .from('support_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Support Fetch Error:", err);
      return [];
    }
  },

  // Added resolveSupportRequest to allow admins to close tickets
  async resolveSupportRequest(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('support_requests')
        .update({ status: 'RESOLVED' })
        .eq('id', id);
      return !error;
    } catch (e) {
      return false;
    }
  },

  /**
   * FAMILY SENTINEL API
   */
  async linkFamilyMember(childEmail: string, parentEmail: string, relation: string): Promise<{ success: boolean; message?: string }> {
    try {
      const { error } = await supabase
        .from('family_links')
        .upsert([{
          guardian_email: childEmail,
          target_email: parentEmail,
          relation_type: relation
        }], { onConflict: 'guardian_email,target_email' });
      
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  },

  async getFamilyTelemetry(childEmail: string): Promise<FamilyMemberStatus[]> {
    try {
      const { data: links, error: linkError } = await supabase
        .from('family_links')
        .select('target_email, relation_type')
        .eq('guardian_email', childEmail);
      
      if (linkError || !links) return [];

      const targetEmails = links.map(l => l.target_email);
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('email, name, safety_status, last_location, battery_level, updated_at, lat, lng')
        .in('email', targetEmails);
      
      if (profileError || !profiles) return [];

      return profiles.map(p => ({
        email: p.email,
        name: p.name || 'Citizen',
        safetyStatus: (p.safety_status || 'SECURE') as any,
        lastLocation: p.last_location || 'Active Node',
        batteryLevel: p.battery_level || 0,
        lastUpdated: new Date(p.updated_at).getTime(),
        relation: links.find(l => l.target_email === p.email)?.relation_type || 'Link',
        lat: p.lat,
        lng: p.lng
      }));
    } catch (err) {
      console.error("[Registry Hub] Telemetry Link Weak");
      return [];
    }
  },

  async updateMyTelemetry(email: string, status: string, location: string, battery: number, lat?: number, lng?: number) {
    try {
      const now = new Date().toISOString();
      await supabase
        .from('profiles')
        .update({
          safety_status: status,
          last_location: location,
          battery_level: battery,
          updated_at: now,
          lat: lat,
          lng: lng
        })
        .eq('email', email);
    } catch (e) {
      console.error("[Neural Pulse] Telemetry Update Failed");
    }
  },

  /**
   * SUBSCRIPTION & ADMIN API
   */
  async getPendingRequests(): Promise<VerificationRequest[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map((order: any) => ({
        id: order.id,
        email: order.user_email,
        name: order.user_name || 'Citizen',
        utr: order.razorpay_payment_id || 'N/A',
        status: order.status as 'PENDING' | 'APPROVED' | 'REJECTED',
        timestamp: new Date(order.created_at).getTime()
      }));
    } catch (err) {
      console.error("Failed to fetch requests:", err);
      return [];
    }
  },

  async approveRequest(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('user_email')
        .eq('id', id)
        .single();
      
      if (orderError) throw orderError;

      const { error: updateOrderError } = await supabase
        .from('orders')
        .update({ status: 'APPROVED' })
        .eq('id', id);
      
      if (updateOrderError) throw updateOrderError;

      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({ 
          is_pro: true, 
          plan_selected: true, 
          plan_type: 'PRO',
          updated_at: new Date().toISOString()
        })
        .eq('email', order.user_email);
      
      if (updateProfileError) throw updateProfileError;

      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  },

  async rejectRequest(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'REJECTED' })
        .eq('id', id);
      
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  },

  async post(endpoint: string, data: any): Promise<{ success: boolean; user?: any; message?: string; data?: any }> {
    if (endpoint === '/auth/register') {
      try {
        const profile = await syncProfile(data.email, {
          name: data.name,
          security_level: 'Standard',
          is_pro: false,
          plan_selected: false
        });
        return { success: true, user: profile, message: "Registry created successfully." };
      } catch (err: any) {
        return { success: false, message: err.message };
      }
    }

    if (endpoint === '/auth/login') {
      try {
        let profile = await getProfile(data.email);
        
        if (data.isSocial && !profile) {
          profile = await syncProfile(data.email, {
            name: data.name || 'Citizen',
            security_level: 'Standard',
            is_pro: false,
            plan_selected: false
          });
        }

        if (profile) {
          return { success: true, user: profile, message: "Handshake successful." };
        }
      } catch (err: any) {
        return { success: false, message: err.message };
      }
    }

    if (endpoint === '/scams/report') {
      try {
        const result = await createScamReportDb(data);
        return { success: true, data: result, message: "Report processed successfully." };
      } catch (err: any) {
        return { success: false, message: err.message };
      }
    }

    return { success: true, user: { ...data, isPro: false } };
  },

  async get(endpoint: string, params?: Record<string, string>) {
    if (endpoint === '/scams') {
      try {
        return await getScamsFromDb(params?.query);
      } catch (err) {
        return [];
      }
    }
    return [];
  },

  async submitUtrForApproval(email: string, name: string, utr: string): Promise<{ success: boolean; message?: string }> {
    try {
      await supabase.from('profiles').upsert({
        email: email,
        name: name || 'Digital Citizen',
        plan_type: 'PRO',
        plan_selected: true,
        updated_at: new Date().toISOString()
      }, { onConflict: 'email' });

      const handshakeToken = utr || `AUTO_SIG_${Date.now()}`;
      const { error } = await supabase
        .from('orders')
        .insert([{
          user_email: email,
          user_name: name || 'Citizen',
          plan_name: 'Neural Pro Shield',
          plan_id: 'PRO',
          amount: 199.00,
          status: 'PENDING',
          razorpay_payment_id: handshakeToken,
          currency: 'INR',
          created_at: new Date().toISOString()
        }]);
      
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message || "Registry signal failed" };
    }
  }
};