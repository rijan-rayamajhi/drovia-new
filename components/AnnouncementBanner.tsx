'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function AnnouncementBanner() {
    const [announcements, setAnnouncements] = useState<string[]>([]);
    const [mounted, setMounted] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetch('/api/announcements', { cache: 'no-store' })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setAnnouncements(data.map((a: any) => a.text));
                }
            })
            .catch(err => console.error('Banner fetch error:', err));
    }, []);

    if (!mounted || announcements.length === 0) return null;

    // Duplicate items enough times to fill screen and ensure smooth loop
    // For mobile, we might need more duplication if the text is short
    // We duplicate 20 times to be safe for large desktop screens (4k etc)
    const duplicatedItems = Array(20).fill(announcements).flat();

    return (
        <div
            className="relative overflow-hidden bg-accent text-white py-3 select-none"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div
                className="flex whitespace-nowrap"
                style={{
                    width: 'max-content',
                    animation: `scroll 40s linear infinite ${isPaused ? 'paused' : 'running'}`,
                }}
            >
                {duplicatedItems.map((text, index) => (
                    <div
                        key={`${index}`}
                        className="flex items-center gap-8 px-8 flex-shrink-0"
                    >
                        <span className="text-sm md:text-base font-medium tracking-wide">
                            {text}
                        </span>
                        <span className="text-gold">•</span>
                    </div>
                ))}
            </div>
            <style jsx>{`
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>
        </div>
    );
}
