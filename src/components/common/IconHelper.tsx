import React from 'react';
import * as LucideIcons from 'lucide-react';

interface IconHelperProps {
  name: string;
  className?: string;
  size?: number;
}

export const IconHelper: React.FC<IconHelperProps> = ({ name, className = 'w-6 h-6', size = 24 }) => {
  // Normalize icon name (e.g. 'cup' -> 'Cup', 'check-circle' -> 'CheckCircle')
  const cleanName = name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('');

  const IconComponent = (LucideIcons as any)[cleanName] || (LucideIcons as any)[name] || LucideIcons.Sparkles;

  return <IconComponent className={className} size={size} aria-hidden="true" />;
};
