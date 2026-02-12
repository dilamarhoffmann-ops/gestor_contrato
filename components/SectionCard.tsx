import React, { ReactNode } from 'react';
import { FileText } from 'lucide-react';

interface SectionCardProps {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
  isComplete?: boolean;
}

export const SectionCard: React.FC<SectionCardProps> = ({ title, children, icon, isComplete }) => {
  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden mb-8 group transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/5">
      <div className="bg-slate-50/50 px-8 py-6 border-b border-slate-100 flex justify-between items-center relative overflow-hidden">
        {/* Decorative corner accent */}
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 transition-all duration-300 group-hover:w-2"></div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white rounded-xl shadow-sm text-blue-600 group-hover:scale-110 transition-transform duration-300">
            {icon ? icon : <FileText size={20} />}
          </div>
          <h3 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h3>
        </div>
        {isComplete && (
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full">
            <span className="text-[10px] font-black uppercase tracking-widest">Validado</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
          </div>
        )}
      </div>
      <div className="p-8">
        {children}
      </div>
    </div>
  );

};