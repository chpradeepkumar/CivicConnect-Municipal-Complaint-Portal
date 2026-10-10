export const SITE = {
  shortName: 'MVMC',
  corpName: 'Mathura-Vrindavan Municipal Corporation',
  corpNameHi: 'मथुरा-वृंदावन नगर निगम',
  stateName: 'Government of Uttar Pradesh',
  stateNameHi: 'उत्तर प्रदेश सरकार',
  city: 'Mathura',
  cityHi: 'मथुरा',
  state: 'Uttar Pradesh',
  tagline: 'One city, one portal — report civic issues and track them to resolution.',
  taglineHi: 'एक शहर, एक पोर्टल — नागरिक समस्याएँ दर्ज करें और समाधान तक ट्रैक करें।',
  portalName: 'CivicConnect',
  portalNameHi: 'सिविककनेक्ट',

  // Public contact information
  helpline: '1800-180-5353',
  helplineLabel: 'Toll-free Helpline',
  controlRoom: '0565-250-1234',
  whatsapp: '+91 90000 00000',
  email: 'helpdesk@mvmc.mathura.gov.in',
  grievanceEmail: 'grievance@mvmc.mathura.gov.in',
  address: 'Municipal Corporation Office, Bhuteshwar Road, Mathura, Uttar Pradesh 281001',
  addressHi: 'नगर निगम कार्यालय, भूतेश्वर रोड, मथुरा, उत्तर प्रदेश २८१००१',
  officeHours: 'Monday – Saturday, 9:30 AM – 5:30 PM (except public holidays)',
  grievanceOfficer: 'Shri. R. K. Sharma, Municipal Commissioner',

  // Drive/link placeholders kept intentionally generic
  rtiOfficer: 'Public Information Officer, MVMC',
};

export const HELPLINES = [
  { service: 'Civic Complaint Helpline (Toll-free)', number: '1800-180-5353', hours: '24 × 7' },
  { service: 'Water Supply & Sewerage', number: '0565-250-1234', hours: '6:00 AM – 10:00 PM' },
  { service: 'Electricity / Streetlights', number: '1912', hours: '24 × 7' },
  { service: 'Sanitation & Solid Waste', number: '0565-250-5678', hours: '6:00 AM – 8:00 PM' },
  { service: 'Fire & Emergency', number: '101', hours: '24 × 7' },
  { service: 'Police', number: '112', hours: '24 × 7' },
  { service: 'Ambulance', number: '108', hours: '24 × 7' },
];

export const NOTICES = [
  {
    id: 'n1',
    date: '2026-09-25',
    title: 'Scheduled water supply maintenance in Ward 12 & 14',
    body: 'Water supply will remain suspended on 28 September from 10:00 AM to 4:00 PM due to pipeline repair near Holi Gate.',
    tag: 'Water',
  },
  {
    id: 'n2',
    date: '2026-09-20',
    title: 'Public notice: property tax payment deadline extended',
    body: 'The last date for property tax payment without penalty has been extended to 31 October 2026.',
    tag: 'Tax',
  },
  {
    id: 'n3',
    date: '2026-09-14',
    title: 'Cleanliness drive across municipal wards',
    body: 'A special sanitation drive will run from 1 to 7 October. Citizens are requested to segregate waste at source.',
    tag: 'Sanitation',
  },
  {
    id: 'n4',
    date: '2026-09-05',
    title: 'Road resurfacing work on Mathura–Vrindavan Road',
    body: 'Resurfacing between Bhuteshwar Chowk and Vrindavan Parikrama Marg will cause temporary diversions.',
    tag: 'Roads',
  },
];

export const FAQS = [
  {
    q: 'Do I need an account to track a complaint?',
    a: 'No. Every complaint receives a unique tracking code. You can check its status on the “Track Complaint” page using only the code — no login required.',
  },
  {
    q: 'How do I register a complaint with the Corporation?',
    a: 'Create a free citizen account, click “Report an Issue”, choose a category, describe the problem, add a photo and your address, then submit. You will get a tracking code instantly.',
  },
  {
    q: 'How long does resolution take?',
    a: 'Resolution time depends on the category and priority. Urgent issues (for example sewage overflow) are targeted within 1 day, high priority within 3 days, medium within 5 days and low within 7 days.',
  },
  {
    q: 'What if my complaint is rejected?',
    a: 'If a complaint is rejected, the reason is shown on the complaint page. You may reopen it with additional details if you believe it was decided incorrectly.',
  },
  {
    q: 'Can I reopen a resolved complaint?',
    a: 'Yes. If the issue recurs or was not fully fixed, open the complaint and use “Reopen”, then explain what is still unresolved.',
  },
  {
    q: 'How is my personal information handled?',
    a: 'Only the information needed to address your complaint is stored. Public tracking shows status and notes without revealing your personal data.',
  },
];

// Minimal bilingual strings for the header, footer and hero.
export const TRANSLATIONS = {
  en: {
    'top.skip': 'Skip to main content',
    'top.state': 'Government of Uttar Pradesh',
    'top.fontSize': 'Font size',
    'top.language': 'Language',
    'top.helpline': 'Helpline',
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.services': 'Services',
    'nav.categories': 'Categories',
    'nav.howItWorks': 'How It Works',
    'nav.track': 'Track Complaint',
    'nav.notices': 'Notices',
    'nav.faq': 'FAQ',
    'nav.contact': 'Contact',
    'action.login': 'Log in',
    'action.register': 'Register',
    'action.report': 'Report an Issue',
    'action.dashboard': 'Dashboard',
    'action.profile': 'Profile',
    'action.logout': 'Log out',
    'hero.title': 'Report civic issues. Track every step.',
    'hero.subtitle': 'The official grievance redressal portal of the Mathura-Vrindavan Municipal Corporation.',
    'hero.report': 'Report an Issue',
    'hero.track': 'Track a Complaint',
    'footer.reachUs': 'Reach Us',
    'footer.quickLinks': 'Quick Links',
    'footer.helplines': 'Emergency Helplines',
    'footer.disclaimer': 'Disclaimer',
  },
  hi: {
    'top.skip': 'मुख्य सामग्री पर जाएँ',
    'top.state': 'उत्तर प्रदेश सरकार',
    'top.fontSize': 'अक्षर आकार',
    'top.language': 'भाषा',
    'top.helpline': 'हेल्पलाइन',
    'nav.home': 'मुख्य पृष्ठ',
    'nav.about': 'परिचय',
    'nav.services': 'सेवाएँ',
    'nav.categories': 'श्रेणियाँ',
    'nav.howItWorks': 'कार्य प्रक्रिया',
    'nav.track': 'शिकायत ट्रैक करें',
    'nav.notices': 'सूचनाएँ',
    'nav.faq': 'सामान्य प्रश्न',
    'nav.contact': 'संपर्क',
    'action.login': 'लॉग इन',
    'action.register': 'पंजीकरण',
    'action.report': 'शिकायत दर्ज करें',
    'action.dashboard': 'डैशबोर्ड',
    'action.profile': 'प्रोफ़ाइल',
    'action.logout': 'लॉग आउट',
    'hero.title': 'नागरिक समस्याएँ दर्ज करें। हर चरण ट्रैक करें।',
    'hero.subtitle': 'मथुरा-वृंदावन नगर निगम का आधिकारिक शिकायत निवारण पोर्टल।',
    'hero.report': 'शिकायत दर्ज करें',
    'hero.track': 'शिकायत ट्रैक करें',
    'footer.reachUs': 'संपर्क करें',
    'footer.quickLinks': 'त्वरित लिंक',
    'footer.helplines': 'आपातकालीन हेल्पलाइन',
    'footer.disclaimer': 'अस्वीकरण',
  },
};

export const DISCLAIMER =
  'This portal is a demonstration built for a mini-project. It is not affiliated with the Mathura-Vrindavan Municipal Corporation or the Government of Uttar Pradesh. All contact details shown are illustrative.';

export default SITE;
