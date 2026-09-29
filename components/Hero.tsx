
import React from 'react';

const Hero: React.FC = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-[#0a0a0c]">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[600px] h-[600px] bg-yellow-600/5 rounded-full blur-[100px]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-blue-900/30 border border-blue-500/20 text-blue-300 px-4 py-1.5 rounded-full text-sm font-medium">
              <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-ping"></span>
              Pioneering Digital Excellence
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight">
              Bringing <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Light</span> to Your <span className="text-yellow-500 font-logo">Dzyns</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              <span className="text-white font-semibold">LightDzyns</span> is your premier partner for cutting-edge web development, breathtaking graphic design, and future-ready digital skills training. We don't just build; we illuminate.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <a 
                href="#portfolio" 
                className="w-full sm:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 group"
              >
                View Our Work
                <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
              </a>
              <a 
                href="#ai-consultant" 
                className="w-full sm:w-auto px-10 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-bold transition-all backdrop-blur-sm flex items-center justify-center gap-2"
              >
                AI Project Planner
                <i className="fa-solid fa-robot text-blue-400"></i>
              </a>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-8 pt-8">
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-white">150+</div>
                <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">Projects Done</div>
              </div>
              <div className="h-10 w-px bg-gray-800"></div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-white">50+</div>
                <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">Global Clients</div>
              </div>
              <div className="h-10 w-px bg-gray-800"></div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-white">1k+</div>
                <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">Talent Trained</div>
              </div>
            </div>
          </div>

          <div className="hidden lg:block relative">
            <div className="relative z-10 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1200" 
                alt="Digital Design Team" 
                className="w-full h-auto grayscale-[0.3] hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent"></div>
            </div>
            
            {/* Floating UI Elements */}
            <div className="absolute -top-6 -right-6 p-5 bg-white rounded-2xl shadow-2xl z-20 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-check text-green-600 text-xl"></i>
                </div>
                <div>
                  <div className="text-xs text-gray-400 font-bold uppercase tracking-tight">Active Project</div>
                  <div className="text-base font-bold text-gray-800">Live & Secured</div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -left-6 p-5 bg-blue-600 rounded-2xl shadow-2xl z-20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-pen-nib text-white text-xl"></i>
                </div>
                <div className="text-white">
                  <div className="text-xs opacity-70 font-bold uppercase tracking-tight">Brand Identity</div>
                  <div className="text-base font-bold">LightDzyns Studio</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
