// SurakshaSetu Types
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  DEEPFAKE_SCAN = 'DEEPFAKE_SCAN',
  SCAM_MONITOR = 'SCAM_MONITOR',
  PAYMENT_GUARD = 'PAYMENT_GUARD',
  PRIVACY_GUARD = 'PRIVACY_GUARD',
  SCAM_DATABASE = 'SCAM_DATABASE',
  SETTINGS = 'SETTINGS',
  CHAT = 'CHAT',
  ABOUT = 'ABOUT',
  SUPPORT = 'SUPPORT',
  PRIVACY_POLICY = 'PRIVACY_POLICY',
  URL_SHIELD = 'URL_SHIELD',
  APK_SCANNER = 'APK_SCANNER',
  ADMIN_PANEL = 'ADMIN_PANEL',
  FAMILY_GUARD = 'FAMILY_GUARD',
  SUBSCRIPTION = 'SUBSCRIPTION',
  ATDS = 'ATDS'
}

export enum AuthView {
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP'
}

export interface User {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
  securityLevel: 'Standard' | 'Enhanced' | 'Maximum';
  isPro?: boolean;
  planSelected?: boolean;
  planType?: 'BASIC' | 'PRO';
  proStatus?: 'PENDING' | 'ACTIVE' | 'NONE';
}

export interface FamilyMemberStatus {
  email: string;
  name: string;
  safetyStatus: 'SECURE' | 'THREAT_DETECTED' | 'OFFLINE';
  lastLocation: string;
  batteryLevel: number;
  lastUpdated: number;
  relation: string;
  lat?: number;
  lng?: number;
}

export interface SupportRequest {
  id: string;
  user_email: string;
  user_name: string;
  subject: string;
  message: string;
  token_id: string;
  status: 'PENDING' | 'RESOLVED';
  created_at: string;
}

export interface Language {
  code: string;
  name: string;
  alertPrefix: string;
}

export interface DeepfakeHistoryEntry {
  id: string;
  timestamp: number;
  result: 'REAL' | 'FAKE';
  confidence: number;
  thumbnail: string;
}

export interface SubscriptionHistoryEntry {
  id: string;
  date: string;
  amount: string;
  status: 'PAID' | 'PENDING' | 'FAILED';
  plan: string;
  txId: string;
}

export interface VerificationRequest {
  id: string;
  email: string;
  name: string;
  utr: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  timestamp: number;
}