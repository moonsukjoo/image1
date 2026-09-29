import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../lib/utils';
import { AdSlot, getAdSettings, AdSetting } from '../lib/store';

interface AdUnitProps {
  slot: AdSlot;
  className?: string;
  height?: string;
}

// Mapping of ad slots to their default Adcash Banner Zone IDs & standard sizes
const SLOT_ZONE_MAP: Record<AdSlot, { pcZone: string; mobileZone: string; pcSize: string; mobileSize: string }> = {
  header: { pcZone: '12192494', mobileZone: '12192538', pcSize: '728x90', mobileSize: '300x100' },
  top: { pcZone: '12192494', mobileZone: '12192538', pcSize: '728x90', mobileSize: '300x100' },
  'content-top': { pcZone: '12192494', mobileZone: '12192502', pcSize: '728x90', mobileSize: '300x250' },
  'content-middle': { pcZone: '12192502', mobileZone: '12192502', pcSize: '300x250', mobileSize: '300x250' },
  'content-bottom': { pcZone: '12192502', mobileZone: '12192502', pcSize: '300x250', mobileSize: '300x250' },
  sidebar: { pcZone: '12192530', mobileZone: '12192530', pcSize: '160x600', mobileSize: '160x600' },
  'result-page': { pcZone: '12192502', mobileZone: '12192502', pcSize: '300x250', mobileSize: '300x250' },
  'download-area': { pcZone: '12192502', mobileZone: '12192502', pcSize: '300x250', mobileSize: '300x250' },
  'download-modal': { pcZone: '12192502', mobileZone: '12192502', pcSize: '300x250', mobileSize: '300x250' },
  'mobile-only': { pcZone: '12192538', mobileZone: '12192538', pcSize: '300x100', mobileSize: '300x100' },
  footer: { pcZone: '12192494', mobileZone: '12192538', pcSize: '728x90', mobileSize: '300x100' },
};

export function AdUnit({ slot, className }: AdUnitProps) {
  const [adConfig, setAdConfig] = useState<AdSetting | null>(null);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const bannerContainerRef = useRef<HTMLDivElement>(null);
  const hasInjectedRef = useRef<boolean>(false);

  useEffect(() => {
    const settings = getAdSettings();
    const config = settings.find(s => s.id === slot);
    if (config) {
      setAdConfig(config);
    }
  }, [slot]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const slotInfo = SLOT_ZONE_MAP[slot] || {
    pcZone: '12192502',
    mobileZone: '12192502',
    pcSize: '300x250',
    mobileSize: '300x250'
  };
  const activeZoneId = isMobile ? slotInfo.mobileZone : slotInfo.pcZone;
  const activeSize = isMobile ? slotInfo.mobileSize : slotInfo.pcSize;

  // Execute Adcash banner script inside container
  useEffect(() => {
    if (!adConfig || !adConfig.enabled) return;
    if (adConfig.device === 'mobile' && !isMobile) return;
    if (adConfig.device === 'pc' && isMobile) return;

    const container = bannerContainerRef.current;
    if (!container) return;

    if (!hasInjectedRef.current) {
      hasInjectedRef.current = true;

      // Clean container
      container.innerHTML = '';

      // If user provided custom HTML/JS code in Admin
      if (adConfig.code && adConfig.code.trim()) {
        const temp = document.createElement('div');
        temp.innerHTML = adConfig.code;
        
        Array.from(temp.querySelectorAll('script')).forEach(oldScript => {
          const newScript = document.createElement('script');
          Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
          newScript.appendChild(document.createTextNode(oldScript.innerHTML));
          oldScript.parentNode?.replaceChild(newScript, oldScript);
        });

        while (temp.firstChild) {
          container.appendChild(temp.firstChild);
        }
      } else {
        // Run standard Adcash Banner for this zone
        // Adcash requires the script tag to be in the DOM so document.currentScript points to it
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.innerHTML = `
          if (typeof aclib !== 'undefined' && aclib.runBanner) {
            aclib.runBanner({ zoneId: '${activeZoneId}' });
          }
        `;
        container.appendChild(script);
      }
    }
  }, [adConfig, activeZoneId, isMobile]);

  if (!adConfig || !adConfig.enabled) {
    return null;
  }

  if (adConfig.device === 'mobile' && !isMobile) return null;
  if (adConfig.device === 'pc' && isMobile) return null;

  return (
    <div className={cn("w-full flex flex-col items-center justify-center my-2 transition-all overflow-hidden", className)}>
      {/* Live Adcash / Custom Banner Container */}
      <div 
        ref={bannerContainerRef} 
        id={`adcash-slot-${slot}`}
        className="relative flex items-center justify-center max-w-full"
      />
    </div>
  );
}
