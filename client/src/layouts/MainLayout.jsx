import { Outlet } from "react-router-dom";
import Hero from "../components/Hero";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../pages/Pages.css";

function MainLayout() {
  return (
    <div className="app">
      <Hero>
        <Navbar variant="dark" />
      </Hero>
      <main className="content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;
