import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, Clock, ShieldAlert } from 'lucide-react';
import { useUi } from '../context/UiContext.jsx';
import { Emblem } from './Emblem.jsx';
import { SITE, HELPLINES, DISCLAIMER } from '../config/site.js';

export function Footer() {
  const { t } = useUi();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-navy-950 text-navy-200">
      <div className="gov-strip h-1" aria-hidden="true" />
      <div className="container-page grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <Emblem className="h-12 w-12" />
            <div>
              <p className="font-display font-bold leading-tight text-white">{SITE.corpName}</p>
              <p className="text-xs text-navy-400">{SITE.corpNameHi}</p>
            </div>
          </div>
          <h3 className="mt-6 text-sm font-semibold text-white">{t('footer.reachUs')}</h3>
          <ul className="mt-3 space-y-2.5 text-sm text-navy-300">
            <li className="flex gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-saffron-400" />
              <span>{SITE.address}</span>
            </li>
            <li className="flex gap-2">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-saffron-400" />
              <a href={`tel:${SITE.helpline}`} className="hover:text-white">{SITE.helpline} ({SITE.helplineLabel})</a>
            </li>
            <li className="flex gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-saffron-400" />
              <a href={`mailto:${SITE.email}`} className="hover:text-white">{SITE.email}</a>
            </li>
            <li className="flex gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-saffron-400" />
              <span>{SITE.officeHours}</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white">{t('footer.quickLinks')}</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link className="hover:text-white" to="/about">{t('nav.about')}</Link></li>
            <li><Link className="hover:text-white" to="/how-it-works">{t('nav.howItWorks')}</Link></li>
            <li><Link className="hover:text-white" to="/categories">{t('nav.categories')}</Link></li>
            <li><Link className="hover:text-white" to="/track">{t('nav.track')}</Link></li>
            <li><Link className="hover:text-white" to="/notices">{t('nav.notices')}</Link></li>
            <li><Link className="hover:text-white" to="/faq">{t('nav.faq')}</Link></li>
            <li><Link className="hover:text-white" to="/contact">{t('nav.contact')}</Link></li>
            <li><Link className="hover:text-white" to="/login">{t('action.login')}</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white">{t('footer.helplines')}</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {HELPLINES.slice(0, 6).map((h) => (
              <li key={h.number + h.service} className="flex items-start justify-between gap-3">
                <span className="text-navy-300">{h.service}</span>
                <a href={`tel:${h.number}`} className="whitespace-nowrap font-semibold text-saffron-300 hover:text-white">{h.number}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
            <ShieldAlert className="h-4 w-4 text-saffron-400" /> {t('footer.disclaimer')}
          </h3>
          <p className="mt-3 text-xs leading-relaxed text-navy-400">{DISCLAIMER}</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link className="hover:text-white" to="/how-it-works">Grievance Redressal Process</Link></li>
            <li><span className="text-navy-400">RTI: {SITE.rtiOfficer}</span></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-navy-800">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-4 text-xs text-navy-400 sm:flex-row">
          <p>© {year} {SITE.corpName}. All rights reserved.</p>
          <p>{t('top.state')} · {SITE.portalName} grievance portal (demonstration)</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
