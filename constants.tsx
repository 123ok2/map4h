
import React from 'react';
import { Utensils, HeartPulse, LifeBuoy, HelpCircle } from 'lucide-react';
import { HelpType, HelpStatus } from './types';

export const HELP_TYPES: { type: HelpType; label: string; icon: React.ReactNode; color: string }[] = [
  { type: 'Food', label: 'Thực phẩm', icon: <Utensils className="w-4 h-4" />, color: 'bg-orange-500' },
  { type: 'Medical', label: 'Y tế', icon: <HeartPulse className="w-4 h-4" />, color: 'bg-green-500' },
  { type: 'Rescue', label: 'Cứu nạn', icon: <LifeBuoy className="w-4 h-4" />, color: 'bg-blue-500' },
  { type: 'Other', label: 'Khác', icon: <HelpCircle className="w-4 h-4" />, color: 'bg-gray-500' },
];

export const STATUS_COLORS: Record<HelpStatus, string> = {
  waiting: '#ef4444',   // Red-500
  assisting: '#eab308', // Yellow-500
  completed: '#22c55e', // Green-500
};

export const VIETNAMESE_LABELS = {
  waiting: 'Đang đợi',
  assisting: 'Đang hỗ trợ',
  completed: 'Đã hoàn thành',
};
