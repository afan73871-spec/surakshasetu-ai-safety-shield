import React from 'react';
import { Shield, Radio, CreditCard, MessageSquare, Twitter, Instagram, Linkedin, Home, Zap, Star, Activity } from 'lucide-react';
import { Language, AppView } from './types';

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', alertPrefix: 'Warning:' },
  { code: 'hi', name: 'हिंदी (Hindi)', alertPrefix: 'सावधान:' },
  { code: 'mr', name: 'मराठी (Marathi)', alertPrefix: 'इशारा:' }
];

export const NAV_ITEMS = [
  { id: AppView.DASHBOARD, label: 'Central Hub', icon: <Home size={24} /> },
  { id: AppView.ATDS, label: 'System Radar', icon: <Activity size={24} /> },
  { id: AppView.SCAM_MONITOR, label: 'Neural Shield', icon: <Radio size={24} /> },
  { id: AppView.CHAT, label: 'AI Assistant', icon: <MessageSquare size={24} /> },
  { id: AppView.SUBSCRIPTION, label: 'Neural Pro', icon: <Star size={24} /> }
];

export const SOCIAL_HANDLES = [
  { id: 'twitter', icon: <Twitter size={18} />, label: '@surakshaseai', url: 'https://x.com/surakshaseai' },
  { id: 'instagram', icon: <Instagram size={18} />, label: '@surakshasetuai', url: 'https://www.instagram.com/surakshasetuai?igsh=OXZ5MzMzOHMxOGty' },
  { id: 'linkedin', icon: <Linkedin size={18} />, label: 'Suraksha Setu India', url: 'https://linkedin.com/company/suraksha-setu' }
];

export const FOOTER_LINKS = [
  { label: 'Privacy Policy', url: '#' },
  { label: 'Terms of Service', url: '#' },
  { label: 'Cyber Helpline', url: 'tel:1930' }
];