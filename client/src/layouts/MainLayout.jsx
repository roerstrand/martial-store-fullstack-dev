import { Outlet } from "react-router-dom";
import Hero from "../components/Hero";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SkipLink from "../components/SkipLink";
import "../pages/Pages.css";

function MainLayout() {
  return (
    <div className="app">
      <SkipLink />
      <Hero>
        <Navbar variant="dark" />
      </Hero>
      <main id="main" className="content" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;
