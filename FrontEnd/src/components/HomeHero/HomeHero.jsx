// HomeHero Component
// in: No props are expected for this component.
// out: Renders a hero section containing a static title and animated text using the ReactTyped library.
//      The component creates an engaging introduction for the application.
// Additional: This component is typically used on the home page to grab users' attention with dynamic messaging.
import React from 'react';

import { ReactTyped } from 'react-typed';
import './HeroSection.css';

const HomeHero = () => {
  

  return (
    <div className="hero-container">

      {/* Hero content: displays the title and animated text */}
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
