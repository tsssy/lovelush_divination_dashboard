import { useState } from 'react';
import { Button } from './ui/button';

interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function Navigation({ activeSection, onSectionChange }: NavigationProps) {
  const navItems = [
    { id: 'chat', label: 'Chat', emoji: '💬' },
    { id: 'products', label: 'Products', emoji: '📦' },
    // { id: 'campaign', label: 'In-app Campaign', emoji: '📢' }, // Temporarily disabled
    { id: 'statistics', label: 'Statistics', emoji: '📊' },
    { id: 'settings', label: 'Settings', emoji: '⚙️' },
  ];

  return (
    <div className="bg-card border-b border-border">
      <div className="px-6 py-3">
        <nav className="flex items-center gap-2">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeSection === item.id ? "default" : "ghost"}
              className="flex items-center gap-2"
              onClick={() => onSectionChange(item.id)}
            >
              <span className="text-base">{item.emoji}</span>
              {item.label}
            </Button>
          ))}
        </nav>
      </div>
    </div>
  );
}