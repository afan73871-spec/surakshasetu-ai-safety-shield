
import React from 'react';
import { ExternalLink } from 'lucide-react';

interface AdBannerProps {
  type?: 'banner' | 'square' | 'text';
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ type = 'banner', className = '' }) => {
  const ads = [
    {
      title: "Google One: Extra Storage",
      desc: "Get more space for memories across Drive, Gmail, and Photos.",
      cta: "Learn More",
      url: "https://one.google.com"
    },
    {
      title: "Secure your Home Wi-Fi",
      desc: "Advanced security features for your Nest Wifi Pro.",
      cta: "Shop Now",
      url: "https://store.google.com"
    },
    {
      title: "Google Play Protect",
      desc: "Check your apps for safety. Built-in protection for Android.",
      cta: "Open Play",
      url: "https://play.google.com"
    }
  ];

  const ad = ads[Math.floor(Math.random() * ads.length)];

  if (type === 'text') {
    return (
      <div className={`p-3 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between ${className}`}>
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mb-0.5 flex items-center gap-1">
            Ads by Google <ExternalLink size={8} />
          </span>
          <p className="text-xs text-gray-700 font-medium">{ad.title}</p>
        </div>
        <button className="text-[10px] font-bold text-indigo-600 border border-indigo-200 px-2 py-1 rounded-md">
          {ad.cta}
        </button>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-white border border-gray-100 rounded-3xl p-4 shadow-sm ${className}`}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-[8px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-widest">
          Sponsored
        </span>
        <span className="text-[8px] text-gray-300 font-bold uppercase tracking-widest flex items-center gap-1">
          Ads by Google <ExternalLink size={8} />
        </span>
      </div>
      
      <div className="flex gap-4">
        <div className="flex-1">
          <h4 className="text-sm font-bold text-gray-800 leading-tight mb-1">{ad.title}</h4>
          <p className="text-[11px] text-gray-500 leading-snug mb-3">
            {ad.desc}
          </p>
          <a 
            href={ad.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block bg-indigo-50 text-indigo-600 text-[10px] font-black px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors"
          >
            {ad.cta}
          </a>
        </div>
        {type === 'banner' && (
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl flex items-center justify-center shrink-0 border border-indigo-50/50">
            <div className="w-8 h-8 rounded-full bg-white/80 blur-[2px]" />
          </div>
        )}
      </div>
    </div>
  );
};
