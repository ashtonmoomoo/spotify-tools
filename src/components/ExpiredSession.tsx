import { Link } from "react-router-dom";

function ExpiredSession() {
  return (
    <Link to="/">Your session has expired, you will need to log in again.</Link>
  );
}

export default ExpiredSession;
