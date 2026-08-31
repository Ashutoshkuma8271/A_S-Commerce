import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const DEFAULT_SETTINGS = {
  announcementText: '✨ Complimentary White-Glove Shipping Across India on Orders Above ₹2,999',
  freeShippingThreshold: 2999,
  heroBadge: 'NEW SEASON COLLECTION 2026',
  heroHeadline: 'Elevate Your Style. Define Your Comfort.',
  heroSubheadline: 'Discover the latest trends in fashion, electronics, and lifestyle. Premium products, best prices at A_S Commerce.',
  heroDiscount: '50% OFF',
  supportPhone: '+91 98765 43210',
  supportEmail: 'concierge@ascommerce.luxury',
  storeName: 'A_S Luxury Commerce',
  heroCtaText: 'Explore Collection',
  heroCtaLink: '/shop',
  supportAddress: 'Sector 62, Noida, Uttar Pradesh 201301',
};

const SettingsContext = createContext(null);

export const normalizeSettings = (data) => {
  if (!data) return DEFAULT_SETTINGS;
  return {
    announcementText: data.announcement_text || data.announcementText || DEFAULT_SETTINGS.announcementText,
    freeShippingThreshold: Number(data.free_shipping_threshold ?? data.freeShippingThreshold) || DEFAULT_SETTINGS.freeShippingThreshold,
    heroBadge: data.hero_badge || data.heroBadge || DEFAULT_SETTINGS.heroBadge,
    heroHeadline: data.hero_headline || data.heroHeadline || DEFAULT_SETTINGS.heroHeadline,
    heroSubheadline: data.hero_subheadline || data.heroSubheadline || DEFAULT_SETTINGS.heroSubheadline,
    heroDiscount: data.hero_discount || data.heroDiscount || DEFAULT_SETTINGS.heroDiscount,
    supportPhone: data.support_phone || data.supportPhone || DEFAULT_SETTINGS.supportPhone,
    supportEmail: data.support_email || data.supportEmail || DEFAULT_SETTINGS.supportEmail,
    storeName: data.store_name || data.storeName || DEFAULT_SETTINGS.storeName,
    heroCtaText: data.hero_cta_text || data.heroCtaText || DEFAULT_SETTINGS.heroCtaText,
    heroCtaLink: data.hero_cta_link || data.heroCtaLink || DEFAULT_SETTINGS.heroCtaLink,
    supportAddress: data.support_address || data.supportAddress || DEFAULT_SETTINGS.supportAddress,
  };
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Try public backend API
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.settings) {
          setSettings(normalizeSettings(data.settings));
          setLoading(false);
          return;
        }
      }

      // 2. Direct Supabase Client fallback
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .or('key.eq.config,id.eq.config')
        .maybeSingle();

      if (!error && data) {
        setSettings(normalizeSettings(data));
      }
    } catch (err) {
      console.warn('Live settings initial fetch note:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Subscribe to Realtime Supabase changes on 'site_settings' table
  useEffect(() => {
    const channel = supabase
      .channel('realtime:public:site_settings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_settings' },
        (payload) => {
          console.log('⚡ [Realtime Site Settings Update received]:', payload.new);
          if (payload.new) {
            setSettings(normalizeSettings(payload.new));
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('⚡ Subscribed to Supabase Realtime Site Settings channel');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        refreshSettings: fetchSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export default SettingsContext;
