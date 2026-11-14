import { Link } from "react-router-dom";
import { ArrowLeftIcon } from "./ui/Icons";

function PageNav({ back, backLabel = "Back", actions }) {
  return (
    <div className="page-nav">
      {back && (
        <Link to={back} className="page-nav__back">
          <ArrowLeftIcon /> {backLabel}
        </Link>
      )}
      {actions && <div className="page-nav__actions">{actions}</div>}
    </div>
  );
}

export default PageNav;
