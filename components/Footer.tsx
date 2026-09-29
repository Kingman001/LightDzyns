
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0a0a0c] pt-20 pb-10 border-t border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-lightbulb text-white text-xl"></i>
              </div>
              <span className="text-2xl font-bold tracking-tight text-white flex items-baseline">
                Light<span className="text-yellow-500 font-logo ml-1">Dzyns</span>
              </span>
            </div>
            <p className="text-gray-400 leading-relaxed text-sm">
              Illuminating businesses through creative design and robust technical solutions. Your startup partner for the digital age.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Quick Links</h4>
            <ul className="space-y-4">
              {['Home', 'Services', 'Portfolio', 'Testimonials'].map((link) => (
                <li key={link}>
                  <a href={`#${link.toLowerCase()}`} className="text-gray-400 hover:text-blue-500 transition-colors text-sm">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Our Expertise</h4>
            <ul className="space-y-4">
              {['Web Development', 'Graphic Design', 'Skill Training', 'AI Consulting'].map((link) => (
                <li key={link}>
                  <a href="#services" className="text-gray-400 hover:text-blue-500 transition-colors text-sm">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Stay Updated</h4>
            <p className="text-gray-400 text-sm mb-6">Join our newsletter to stay updated on the latest in tech and design.</p>
            <form className="flex gap-2">
              <input 
                type="email" 
                placeholder="Enter email" 
                className="bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white w-full focus:ring-2 focus:ring-blue-600 outline-none"
              />
              <button className="bg-blue-600 text-white px-5 rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center shadow-lg shadow-blue-600/20">
                <i className="fa-solid fa-paper-plane"></i>
              </button>
            </form>
          </div>
        </div>

        <div className="pt-10 border-t border-gray-800/50 flex flex-col md:flex-row items-center justify-between gap-6 text-gray-500 text-xs font-medium uppercase tracking-wider">
          <p>© 2025 LightDzyns Studio. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
