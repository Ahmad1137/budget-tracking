import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";
import TransactionsPage from "./pages/TransactionsPage";
import WalletsPage from "./pages/WalletsPage";
import BudgetsPage from "./pages/BudgetsPage";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import "./index.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/wallets" element={<WalletsPage />} />
            <Route path="/budgets" element={<BudgetsPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
