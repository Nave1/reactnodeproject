import Navbar from "./components/Navbar/index";
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import "./App.css";
import Home from "./pages/index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Signup from "./pages/Signup";
import Footer from "./components/Footer/Footer";
import Interface from './pages/features/Interface';
import Map from './pages/features/Map';
import Updates from './pages/features/Updates';
import Notifications from './pages/features/Notifications';
import Database from './pages/features/Database';
import Mobile from './pages/features/Mobile';


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path='/' exact Component={Home} />
        <Route path='/About' Component={About} />
        <Route path='/Contact' Component={Contact} />
        <Route path='/Signup' Component={Signup} />
        <Route path="/feature/interface" Component={Interface} />
        <Route path="/feature/map" Component={Map} />
        <Route path="/feature/updates" Component={Updates} />
        <Route path="/feature/notifications" Component={Notifications} />
        <Route path="/feature/database" Component={Database} />
        <Route path="/feature/mobile" Component={Mobile} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
