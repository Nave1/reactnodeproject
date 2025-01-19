import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const Home = () => {
  const projectElements = [
    { name: "User-friendly web interface", path: "/feature/interface" },
    { name: "Interactive map", path: "/feature/map" },
    { name: "Real-time updates", path: "/feature/updates" },
    { name: "Notifications for city councils", path: "/feature/notifications" },
    { name: "Efficient database", path: "/feature/database" },
    { name: "Mobile-friendly design", path: "/feature/mobile" },
  ];

  return (
    <div className="home-container">
      <h1>Welcome to Garbage Collector</h1>
      <p>
        A platform dedicated to making your city cleaner and more sustainable.
        Click on a feature to learn more:
      </p>
      <ul className="project-list">
        {projectElements.map((element, index) => (
          <li key={index} className="project-list-item">
            <Link to={element.path} className="project-link">
              {element.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
