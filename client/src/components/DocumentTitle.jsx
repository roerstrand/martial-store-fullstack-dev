import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { titleFor } from "../utils/pageTitle";

function DocumentTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = titleFor(pathname);
  }, [pathname]);

  return null;
}

export default DocumentTitle;
