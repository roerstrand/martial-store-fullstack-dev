import { Outlet } from "react-router-dom";
import { useState } from "react";
import Hero from "../components/Hero";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../pages/Pages.css";

function MainLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app">
      <div className="apex-header-wrap">
        <Hero onToggleMenu={() => setMenuOpen((prev) => !prev)} />
        <Navbar isOpen={menuOpen} onToggleMenu={() => setMenuOpen((prev) => !prev)} />
      </div>
      <main className="content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;
