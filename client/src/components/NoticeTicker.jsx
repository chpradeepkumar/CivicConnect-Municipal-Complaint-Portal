import { Link } from 'react-router-dom';
import { Megaphone, ArrowRight } from 'lucide-react';
import { NOTICES } from '../config/site.js';

export function NoticeTicker() {
  const items = [...NOTICES, ...NOTICES];
  return (
    <div className="border-b border-saffron-200 bg-saffron-50">
      <div className="container-page flex items-center gap-3 py-2">
        <span className="badge shrink-0 bg-saffron-500 text-white">
          <Megaphone className="h-3.5 w-3.5" /> Latest
        </span>
        <div className="relative flex-1 overflow-hidden">
          <div className="flex w-max animate-marquee whitespace-nowrap">
            {items.map((n, i) => (
              <span key={`${n.id}-${i}`} className="px-5 text-sm text-navy-700">
                <span className="font-semibold text-navy-900">{n.title}</span>
                <span className="mx-2 text-navy-300">•</span>
              </span>
            ))}
          </div>
        </div>
        <Link to="/notices" className="flex shrink-0 items-center gap-1 text-xs font-semibold text-civic-800 hover:underline">
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

export default NoticeTicker;
