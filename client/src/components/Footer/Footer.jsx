import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'About Us', path: '/about' },
      { name: 'How It Works', path: '/about#how-it-works' },
      { name: 'Features', path: '/about#features' },
    ],
    support: [
      { name: 'Help Center', path: '#' },
      { name: 'Contact Us', path: '#' },
      { name: 'FAQ', path: '#' },
    ],
    legal: [
      { name: 'Privacy Policy', path: '#' },
      { name: 'Terms of Service', path: '#' },
      { name: 'Cookie Policy', path: '#' },
    ],
  };

  return (
    <footer className="border-t soft-border glass-panel mt-auto">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-2xl brand-gradient shadow-sm flex items-center justify-center">
                <span className="text-xs font-semibold tracking-tight text-white">SS</span>
              </div>
              <span className="app-section-title text-base font-semibold text-strong">SkillSwap</span>
            </div>
            <p className="text-sm text-muted mb-4">
              Exchange what you know for what you want to learn. Connect with people worldwide.
            </p>
            <div className="flex gap-3">
              <a href="#" className="text-soft hover:text-strong transition-colors">
                <span className="iconify" data-icon="lucide:twitter" data-width="18" data-height="18"></span>
              </a>
              <a href="#" className="text-soft hover:text-strong transition-colors">
                <span className="iconify" data-icon="lucide:github" data-width="18" data-height="18"></span>
              </a>
              <a href="#" className="text-soft hover:text-strong transition-colors">
                <span className="iconify" data-icon="lucide:linkedin" data-width="18" data-height="18"></span>
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold text-strong mb-3">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-sm text-muted hover:text-[color:var(--accent)] transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-sm font-semibold text-strong mb-3">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a href={link.path} className="text-sm text-muted hover:text-[color:var(--accent)] transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-semibold text-strong mb-3">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <a href={link.path} className="text-sm text-muted hover:text-[color:var(--accent)] transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t soft-border">
          <p className="text-center text-xs text-soft">
            © {currentYear} SkillSwap. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
