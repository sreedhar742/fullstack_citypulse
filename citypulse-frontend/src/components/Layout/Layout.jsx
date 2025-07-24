import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import './layout.css';

const Layout = ({ children }) => {
  return (
    <div className="layout-container">
      <Navbar />
      <main className="main-content">
        { children }
      </main>
    </div>
  );
};

export default Layout;