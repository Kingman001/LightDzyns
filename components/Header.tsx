
import React, { useState, useEffect } from 'react';

interface HeaderProps {
  onOpenPortal: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenPortal }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Services', href: '#services' },
    { name: 'Portfolio', href: '#portfolio' },
    { name: 'AI Consultant', href: '#ai-consultant' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-blue-500/20">
            <i className="fa-solid fa-lightbulb text-white text-xl"></i>
          </div>
          <span className={`text-2xl font-bold tracking-tight flex items-baseline ${isScrolled ? 'text-gray-900' : 'text-white'}`}>
            Light<span className="text-yellow-500 font-logo ml-1 text-3xl">Dzyns</span>
          </span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-blue-500 ${
                isScrolled ? 'text-gray-700' : 'text-white/90'
              }`}
            >
              {link.name}
            </a>
          ))}
          <div className="h-6 w-px bg-gray-500/30"></div>
          <button 
            onClick={onOpenPortal}
            className="text-sm font-bold text-blue-500 hover:text-blue-600 flex items-center gap-2"
          >
            <i className="fa-solid fa-graduation-cap"></i>
            Academy Portal
          </button>
          <button className="bg-blue-600 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 hover:-translate-y-0.5 active:translate-y-0">
            Get Started
          </button>
        </nav>

        {/* Mobile Toggle */}
        <button 
          className={`md:hidden ${isScrolled ? 'text-gray-900' : 'text-white'}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-2xl`}></i>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 animate-fade-in-down">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="block px-3 py-3 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <button 
              onClick={() => { onOpenPortal(); setIsMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-3 text-base font-bold text-blue-600 flex items-center gap-2"
            >
              <i className="fa-solid fa-graduation-cap"></i> Academy Portal
            </button>
            <div className="pt-4">
              <button className="w-full bg-blue-600 text-white px-5 py-3 rounded-xl text-base font-semibold hover:bg-blue-700 transition-all">
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
