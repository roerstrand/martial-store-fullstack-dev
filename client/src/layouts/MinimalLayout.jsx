import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function MinimalLayout() {
  return (
    <div className="app">
      <Navbar variant="light" />
      <main className="content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default MinimalLayout;
