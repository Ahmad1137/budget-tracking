import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-blue-600 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-2xl font-bold">
          Budget Tracker
        </Link>
        <div className="space-x-4">
          {user ? (
            <>
              <Link to="/dashboard" className="text-white hover:text-blue-200">
                Dashboard
              </Link>
              <Link to="/profile" className="text-white hover:text-blue-200">
                Profile
              </Link>
              <Link
                to="/transactions"
                className="text-white hover:text-blue-200"
              >
                Transactions
              </Link>
              <Link to="/wallets" className="text-white hover:text-blue-200">
                Wallets
              </Link>
              <Link to="/budgets" className="text-white hover:text-blue-200">
                Budgets
              </Link>
              <button
                onClick={handleLogout}
                className="text-white hover:text-blue-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/" className="text-white hover:text-blue-200">
                Home
              </Link>
              <Link to="/login" className="text-white hover:text-blue-200">
                Login
              </Link>
              <Link to="/register" className="text-white hover:text-blue-200">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
