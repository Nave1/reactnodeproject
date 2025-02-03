import React from 'react';

import { ReactTyped } from 'react-typed';
import './HeroSection.css';

const HomeHero = () => {
  

  return (
    <div className="hero-container">

      {/* תוכן ההירו (כותרת + טקסט מקליד) */}
      <div className="hero-content">
        <h1>Garbage Collector</h1>
        <ReactTyped
          strings={[
            'Making your city cleaner...',
            'Tracking garbage in real time...',
            'Join us now!'
          ]}
          typeSpeed={50}
          backSpeed={30}
          loop
        />
      </div>
    </div>
  );
};

export default HomeHero;
