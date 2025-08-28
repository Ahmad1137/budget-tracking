import { useEffect, useState } from "react";
import api from "../utils/api";
import BudgetForm from "../components/Budgets/BudgetForm";
import BudgetList from "../components/Budgets/BudgetList";
import BudgetChart from "../components/Budgets/BudgetChart";

function BudgetsPage() {
  const [budgets, setBudgets] = useState([]);
  const [wallets, setWallets] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [budgetsRes, walletsRes] = await Promise.all([
          api.get("/api/budgets?year=2025&month=8"),
          api.get("/api/wallets"),
        ]);
        setBudgets(budgetsRes.data);
        setWallets(walletsRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleAdd = (budget) => {
    setBudgets([budget, ...budgets]);
  };

  return (
    <div className="container mx-auto mt-10">
      <h2 className="text-3xl font-bold mb-6">Budgets</h2>
      <BudgetForm wallets={wallets} onAdd={handleAdd} />
      <BudgetList budgets={budgets} />
      <BudgetChart />
    </div>
  );
}

export default BudgetsPage;
