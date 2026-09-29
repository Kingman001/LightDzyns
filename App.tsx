
import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import Portfolio from './components/Portfolio';
import AIConsultant from './components/AIConsultant';
import Testimonials from './components/Testimonials';
import Contact from './components/Contact';
import Footer from './components/Footer';
import LearningPortal from './components/LearningPortal';

const App: React.FC = () => {
  const [showPortal, setShowPortal] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <Header onOpenPortal={() => setShowPortal(true)} />
      
      <main className="flex-grow">
        <Hero />
        <Services />
        <Portfolio />
        <AIConsultant />
        <Testimonials />
        <Contact />
      </main>

      <Footer />

      {showPortal && <LearningPortal onClose={() => setShowPortal(false)} />}
    </div>
  );
};

export default App;
