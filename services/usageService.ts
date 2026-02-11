const LIMITS = {
  SCAM_BLOCKER: 5,
  UPI_SAFE: 5,
  AI_ASSISTANT_MINS: 5,
  AI_CHAT_MINS: 5,
  DEEPFAKE_SCANS: 5,
  APK_SCANS: 5
};

// Added UsageData interface
export interface UsageData {
  date: string;
  scam: number;
  upi: number;
  assistantMins: number;
  chatMins: number;
  deepfake: number;
  apk: number;
}

export const usageService = {
  // Updated getUsage to handle all metrics
  getUsage(): UsageData {
    const today = new Date().toDateString();
    const saved = localStorage.getItem('suraksha_usage_v9');
    
    let usage: UsageData = saved ? JSON.parse(saved) : { 
      date: today, 
      scam: 0, 
      upi: 0, 
      assistantMins: 0, 
      chatMins: 0,
      deepfake: 0,
      apk: 0
    };

    if (usage.date !== today) {
      usage = { 
        date: today, 
        scam: 0, 
        upi: 0, 
        assistantMins: 0, 
        chatMins: 0,
        deepfake: 0,
        apk: 0
      };
      this.saveUsage(usage);
    }
    return usage;
  },

  saveUsage(usage: UsageData) {
    localStorage.setItem('suraksha_usage_v9', JSON.stringify(usage));
    window.dispatchEvent(new CustomEvent('usage-updated'));
  },

  isTrialActive(): boolean {
    return true; 
  },

  canUseFeature(type: keyof typeof LIMITS, isPro: boolean): boolean {
    if (isPro) return true;
    
    const usage = this.getUsage();
    switch(type) {
      case 'SCAM_BLOCKER': return usage.scam < LIMITS.SCAM_BLOCKER;
      case 'UPI_SAFE': return usage.upi < LIMITS.UPI_SAFE;
      case 'AI_ASSISTANT_MINS': return usage.assistantMins < LIMITS.AI_ASSISTANT_MINS;
      case 'AI_CHAT_MINS': return usage.chatMins < LIMITS.AI_CHAT_MINS;
      case 'DEEPFAKE_SCANS': return usage.deepfake < LIMITS.DEEPFAKE_SCANS;
      case 'APK_SCANS': return usage.apk < LIMITS.APK_SCANS;
      default: return false;
    }
  },

  // Updated incrementUsage signature to support all features including chatMins
  incrementUsage(type: 'scam' | 'upi' | 'deepfake' | 'assistantMins' | 'chatMins' | 'apk') {
    const usage = this.getUsage();
    usage[type] += 1;
    this.saveUsage(usage);
  },

  addAssistantMins(mins: number) {
    const usage = this.getUsage();
    usage.assistantMins += mins;
    this.saveUsage(usage);
  },

  addChatMins(mins: number) {
    const usage = this.getUsage();
    usage.chatMins += mins;
    this.saveUsage(usage);
  },

  getLimits() {
    return LIMITS;
  },

  getTrialRemainingDays(): number {
    return 365;
  },

  // Added getRemainingCredits method
  getRemainingCredits(isPro: boolean) {
    if (isPro) return { 
      scam: '∞', 
      upi: '∞', 
      assistant: '∞', 
      chat: '∞', 
      deepfake: '∞',
      apk: '∞'
    };
    
    const usage = this.getUsage();
    return {
      scam: Math.max(0, LIMITS.SCAM_BLOCKER - usage.scam),
      upi: Math.max(0, LIMITS.UPI_SAFE - usage.upi),
      assistant: Math.max(0, LIMITS.AI_ASSISTANT_MINS - usage.assistantMins),
      chat: Math.max(0, LIMITS.AI_CHAT_MINS - usage.chatMins),
      deepfake: Math.max(0, LIMITS.DEEPFAKE_SCANS - usage.deepfake),
      apk: Math.max(0, LIMITS.APK_SCANS - usage.apk)
    };
  }
};