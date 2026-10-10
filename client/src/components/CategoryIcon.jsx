import {
  Construction, Trash2, Lightbulb, Droplets, Waves, Building2, AlertCircle,
  TrafficCone, TreePine, Volume2, ShieldCheck,
} from 'lucide-react';

const ICONS = {
  construction: Construction,
  'trash-2': Trash2,
  lightbulb: Lightbulb,
  droplets: Droplets,
  waves: Waves,
  'building-2': Building2,
  'alert-circle': AlertCircle,
  'traffic-cone': TrafficCone,
  'tree-pine': TreePine,
  'volume-2': Volume2,
};

export function CategoryIcon({ name = 'alert-circle', className = 'h-5 w-5', ...props }) {
  const Icon = ICONS[name] || AlertCircle;
  return <Icon className={className} {...props} />;
}

export const CATEGORY_ICON_NAMES = Object.keys(ICONS);

export function StatusIcon({ className = 'h-5 w-5' }) {
  return <ShieldCheck className={className} />;
}

export default CategoryIcon;
