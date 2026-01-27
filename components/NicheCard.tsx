
import React from 'react';
import { Niche } from '../types';
import { TrendingUp, AlertCircle, BarChart2, ArrowRight } from 'lucide-react';

interface NicheCardProps {
  niche: Niche;
  onClick?: () => void;
}

const NicheCard: React.FC<NicheCardProps> = ({ niche, onClick }) => {
  const getScoreColor = (score: number) => {
    if (score > 70) return 'text-emerald-600 bg-emerald-50';
    if (score > 40) return 'text-amber-600 bg-amber-50';
    return 'text-rose-600 bg-rose-50';
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1 block">
            {niche.category}
          </span>
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
            {niche.title}
          </h3>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(niche.total_score)}`}>
          Score: {niche.total_score?.toFixed(1)}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="flex flex-col">
          <span className="text-gray-500 text-xs flex items-center gap-1 mb-1">
            <TrendingUp size={14} /> Growth
          </span>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full transition-all duration-700" 
              style={{ width: `${niche.growth_score}%` }} 
            />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-500 text-xs flex items-center gap-1 mb-1">
            <AlertCircle size={14} /> Pain
          </span>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-rose-400 h-full transition-all duration-700" 
              style={{ width: `${niche.pain_score}%` }} 
            />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-500 text-xs flex items-center gap-1 mb-1">
            <BarChart2 size={14} /> Comp
          </span>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-amber-400 h-full transition-all duration-700" 
              style={{ width: `${niche.competition_score}%` }} 
            />
          </div>
        </div>
      </div>

      <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">
        {niche.ai_summary}
      </p>

      <div className="flex items-center text-blue-600 font-medium text-sm group-hover:gap-2 transition-all">
        View Deep Analysis <ArrowRight size={16} className="ml-1" />
      </div>
    </div>
  );
};

export default NicheCard;
