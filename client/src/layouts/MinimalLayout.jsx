import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SkipLink from "../components/SkipLink";

function MinimalLayout() {
  return (
    <div className="app">
      <SkipLink />
      <Navbar variant="light" />
      <main id="main" className="content" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default MinimalLayout;
