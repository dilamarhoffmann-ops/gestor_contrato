import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

interface FAQItem {
    question: string;
    answer: string;
}

interface SectionFAQProps {
    sectionId: string;
    items: FAQItem[];
}

export const SectionFAQ: React.FC<SectionFAQProps> = ({ sectionId, items }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    if (items.length === 0) return null;

    return (
        <div className="mt-6 border-t border-ice-blue pt-6">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-primary-blue font-bold text-xs uppercase tracking-widest hover:text-deep-blue transition-colors group"
            >
                <BookOpen size={16} className="group-hover:rotate-12 transition-transform" />
                <span>Guia Rápido & Perguntas Frequentes (Seção {sectionId})</span>
                <ChevronDown size={16} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up">
                    {items.map((item, idx) => (
                        <div
                            key={idx}
                            className="bg-ice-blue/50 rounded-2xl p-4 border border-light-blue hover:bg-ice-blue transition-all interactive-card cursor-pointer"
                            onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
                        >
                            <div className="flex justify-between items-start gap-4">
                                <h4 className="text-sm font-bold text-deep-blue">{item.question}</h4>
                                <div className="text-light-blue mt-1">
                                    {expandedIndex === idx ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </div>
                            </div>
                            {expandedIndex === idx && (
                                <p className="mt-2 text-xs text-deep-navy/70 leading-relaxed animate-slide-up">
                                    {item.answer}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
