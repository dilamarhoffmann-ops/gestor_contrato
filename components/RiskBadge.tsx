import React from 'react';
import { RiskLevel } from '../types';

interface RiskBadgeProps {
  level: RiskLevel;
  score: number;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, score }) => {
  const colors = {
    Verde: 'bg-green-100 text-green-800 border-green-200',
    Amarelo: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Vermelho: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <div className={`flex items-center px-3 py-1 rounded-full border ${colors[level]}`}>
      <div className={`w-3 h-3 rounded-full mr-2 ${level === 'Vermelho' ? 'bg-red-500' : level === 'Amarelo' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
      <span className="font-semibold text-sm">
        {level.toUpperCase()} ({score})
      </span>
    </div>
  );
};