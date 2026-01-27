
import React from 'react';
import { MarketSignal } from '../types';
import { MessageSquare, Youtube, Search, ExternalLink, BarChart } from 'lucide-react';

interface PainPointCardProps {
  signal: MarketSignal;
}

const PainPointCard: React.FC<PainPointCardProps> = ({ signal }) => {
  const getIcon = () => {
    switch (signal.source_type) {
      case 'reddit': return <MessageSquare size={18} className="text-orange-500" />;
      case 'youtube': return <Youtube size={18} className="text-red-500" />;
      case 'google_trends': return <BarChart size={18} className="text-blue-500" />;
      default: return <Search size={18} className="text-gray-400" />;
    }
  };

  const formatSource = (src: string) => src.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          {getIcon()}
          <span className="text-sm font-semibold text-gray-700">{formatSource(signal.source_type)}</span>
        </div>
      </div>
      <p className="text-gray-600 text-sm italic mb-4 leading-relaxed">
        "{signal.content_snippet}"
      </p>
      <a 
        href={signal.source_url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-xs text-gray-400 hover:text-blue-500 flex items-center gap-1"
      >
        Source Link <ExternalLink size={12} />
      </a>
    </div>
  );
};

export default PainPointCard;
