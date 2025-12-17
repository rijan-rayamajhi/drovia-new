import Link from 'next/link';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-gray-100 mt-32">
      <div className="container-max px-4 sm:px-6 lg:px-8 xl:px-20 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="block mb-6">
              <img
                src="/logo.png"
                alt="DROVIA"
                className="h-24 object-contain"
              />
            </Link>
            <p className="text-text-muted text-[15px] leading-relaxed">
              Premium fashion clothing for the modern lifestyle. Quality meets style.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-text-primary mb-6 text-[15px] tracking-wide">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/shop" className="text-text-muted hover:text-accent text-[15px] transition-colors duration-300">
                  Shop
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-text-muted hover:text-accent text-[15px] transition-colors duration-300">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/policies/refund" className="text-text-muted hover:text-accent text-[15px] transition-colors duration-300">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="font-semibold text-text-primary mb-6 text-[15px] tracking-wide">Policies</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/policies/terms" className="text-text-muted hover:text-accent text-[15px] transition-colors duration-300">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/policies/privacy" className="text-text-muted hover:text-accent text-[15px] transition-colors duration-300">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold text-text-primary mb-6 text-[15px] tracking-wide">Follow Us</h4>
            <div className="flex gap-3">
              <a href="#" className="p-2.5 hover:bg-ivory rounded-xl transition-all duration-300 group" aria-label="Facebook">
                <Facebook className="w-5 h-5 text-text-muted group-hover:text-accent transition-colors duration-300" />
              </a>
              <a href="#" className="p-2.5 hover:bg-ivory rounded-xl transition-all duration-300 group" aria-label="Instagram">
                <Instagram className="w-5 h-5 text-text-muted group-hover:text-accent transition-colors duration-300" />
              </a>
              <a href="#" className="p-2.5 hover:bg-ivory rounded-xl transition-all duration-300 group" aria-label="Twitter">
                <Twitter className="w-5 h-5 text-text-muted group-hover:text-accent transition-colors duration-300" />
              </a>
              <a href="#" className="p-2.5 hover:bg-ivory rounded-xl transition-all duration-300 group" aria-label="YouTube">
                <Youtube className="w-5 h-5 text-text-muted group-hover:text-accent transition-colors duration-300" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-12 pt-8 text-center">
          <p className="text-text-muted text-sm mb-3">&copy; {new Date().getFullYear()} Fashion Brand. All rights reserved.</p>
          <p className="text-text-muted text-sm">
            Powered by{' '}
            <a
              href="https://spotwebs.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:text-gold-dark transition-colors duration-300 font-semibold"
            >
              SPOTWEBS
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

