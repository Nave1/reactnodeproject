import React from 'react';
import '../App.css';

const About = () => {
  return (
    <div className="about-container">
      <div className="about-content">
        <img
          src={require("../assets/myImage.jpg")}
          alt="Nave Shitrit"
          className="about-photo"
        />
        <div className="about-description">
          <h1>About Me</h1>
          <p>
            Hi! I'm Nave Shitrit, a software engineering student with a passion for
            coding, nature photography, and creating meaningful projects. I strive to
            combine creativity and practicality in all my endeavors. Welcome to my world!
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
