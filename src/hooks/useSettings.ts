import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { SiteSettings } from '../types';

export function useSettings() {
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('site_settings')
                .select('*')
                .eq('id', 'global')
                .single();

            if (error) throw error;
            if (data) {
                setSettings(data);
                // Update dynamic values immediately
                document.title = data.site_name;

                const metaDesc = document.querySelector('meta[name="description"]');
                if (metaDesc) metaDesc.setAttribute('content', data.site_description);

                if (data.favicon_url) {
                    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
                    if (link) link.href = data.favicon_url;
                }

                if (data.primary_color) {
                    document.documentElement.style.setProperty('--color-zaeom-neon', data.primary_color);
                }
            }
        } catch (err) {
            console.error('Error fetching settings:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    return { settings, loading, refreshSettings: fetchSettings };
}
