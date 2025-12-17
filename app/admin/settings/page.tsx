'use client';

import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import Button from '@/components/Button';
import Input from '@/components/Input';

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        shippingEnabled: true,
        shippingCharge: 99,
        freeShippingThreshold: 2000,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            if (res.ok) {
                const data = await res.json();
                setSettings(data);
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });

            if (res.ok) {
                alert('Settings saved successfully');
            } else {
                alert('Failed to save settings');
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
            alert('An error occurred');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Settings</h1>

            <div className="bg-white rounded-xl p-6 shadow-soft max-w-2xl">
                <h2 className="text-xl font-bold mb-6">Shipping Configuration</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex items-center gap-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.shippingEnabled}
                                onChange={(e) => setSettings({ ...settings, shippingEnabled: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            <span className="ml-3 text-sm font-medium text-gray-900">Enable Shipping Charges</span>
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Shipping Charge (₹)"
                            type="number"
                            value={settings.shippingCharge}
                            onChange={(e) => setSettings({ ...settings, shippingCharge: Number(e.target.value) })}
                            disabled={!settings.shippingEnabled}
                        />
                        <Input
                            label="Free Shipping Threshold (₹)"
                            type="number"
                            value={settings.freeShippingThreshold}
                            onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                            disabled={!settings.shippingEnabled}
                        />
                    </div>

                    <div className="pt-4">
                        <Button type="submit" variant="primary" className="flex items-center gap-2" disabled={saving}>
                            <Save className="w-4 h-4" />
                            {saving ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
