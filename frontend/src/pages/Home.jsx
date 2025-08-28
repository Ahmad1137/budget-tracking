import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Home() {
  const { user } = useContext(AuthContext);

  return (
    <div className="container mx-auto mt-10 text-center">
      <h1 className="text-4xl font-bold mb-6">Welcome to Budget Tracker</h1>
      <p className="text-lg mb-6">
        Manage your finances and track shared budgets with ease.
      </p>
      {user ? (
        <Link
          to="/dashboard"
          className="inline-block bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700"
        >
          Go to Dashboard
        </Link>
      ) : (
        <div className="space-x-4">
          <Link
            to="/login"
            className="inline-block bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="inline-block bg-green-600 text-white p-3 rounded-md hover:bg-green-700"
          >
            Register
          </Link>
        </div>
      )}
    </div>
  );
}

export default Home;
