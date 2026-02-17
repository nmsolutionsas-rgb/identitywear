import { Link } from 'react-router';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

const footerColumns = [
  {
    title: 'Help',
    links: [
      'Help / FAQ',
      'Delivery Information',
      'Returns',
      'Orders',
      'Accessibility Statement',
    ],
  },
  {
    title: 'Legal',
    links: ['Terms & Conditions', 'Privacy Policy', 'Sustainability'],
  },
  {
    title: 'Community',
    links: ['Student Discount', 'Newsletter', 'Referral Program'],
  },
];

const paymentMethods = [
  'Visa',
  'Mastercard',
  'PayPal',
  'Apple Pay',
  'Klarna',
  'Afterpay',
  'Amex',
];

const socialItems = [
  { label: 'Instagram', href: 'https://instagram.com', icon: <Instagram size={16} /> },
  { label: 'TikTok', href: 'https://www.tiktok.com', icon: <span className="text-[11px] font-bold">TT</span> },
  { label: 'YouTube', href: 'https://www.youtube.com', icon: <Youtube size={16} /> },
  { label: 'Facebook', href: 'https://facebook.com', icon: <Facebook size={16} /> },
  { label: 'Pinterest', href: 'https://www.pinterest.com', icon: <span className="text-[11px] font-bold">P</span> },
  { label: 'Twitter', href: 'https://x.com', icon: <Twitter size={16} /> },
  { label: 'Discord', href: 'https://discord.com', icon: <span className="text-[11px] font-bold">D</span> },
];

const toPath = (label) =>
  `/info/${label
    .toLowerCase()
    .replace(/\//g, '')
    .replace(/&/g, 'and')
    .replace(/\s+/g, '-')}`;

export function Footer({ footer, header, publicStoreDomain }) {
  return (
    <footer className="bg-[#0f1115] text-white border-t border-white/10 relative">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(25,103,255,0.12),transparent_34%),radial-gradient(circle_at_top_right,rgba(228,32,44,0.14),transparent_40%)]" />

      <div className="relative mx-auto max-w-[1700px] px-5 md:px-8 lg:px-10 py-14 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-10 border-b border-white/10 pb-12">
          <div className="xl:col-span-2">
            <Link to="/" className="inline-block mb-4">
              <span className="font-oswald text-3xl leading-none">IDENTITYWEAR</span>
            </Link>
            <p className="max-w-md text-sm text-white/70 leading-relaxed">
              Functional performance gear for training, athleisure, and rest-day movement. Built for high output,
              designed for everyday identity.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {socialItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  aria-label={item.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 min-w-9 px-3 border border-white/20 text-white/80 inline-flex items-center justify-center hover:bg-white hover:text-black transition-colors text-xs uppercase tracking-wide"
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="text-xs tracking-[0.16em] text-white/60 mb-4">{column.title}</h3>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link}>
                    <Link to={toPath(link)} className="text-sm text-white/90 hover:text-[#e4202c] transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-white/55 mb-3">Payment Methods</p>
            <div className="flex flex-wrap gap-2">
              {paymentMethods.map((method) => (
                <span
                  key={method}
                  className="h-8 px-3 border border-white/20 bg-white/5 text-xs uppercase tracking-wide inline-flex items-center"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>

          <p className="text-xs text-white/55">© {new Date().getFullYear()} identitywear. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
