import { useEffect, useState } from "react";
import api from "../utils/api";
import TransactionChart from "../components/Transactions/TransactionChart";
import BudgetChart from "../components/Budgets/BudgetChart";

function Dashboard() {
  const [stats, setStats] = useState({ totalIncome: 0, totalExpense: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/api/transactions/charts?period=month");
        const income =
          res.data.find((d) => d._id.type === "income")?.total || 0;
        const expense =
          res.data.find((d) => d._id.type === "expense")?.total || 0;
        setStats({ totalIncome: income, totalExpense: expense });
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="container mx-auto mt-10">
      <h2 className="text-3xl font-bold mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4">Summary</h3>
          <p>Total Income: ${stats.totalIncome}</p>
          <p>Total Expense: ${stats.totalExpense}</p>
          <p>Balance: ${(stats.totalIncome - stats.totalExpense).toFixed(2)}</p>
        </div>
        <TransactionChart />
        <BudgetChart />
      </div>
    </div>
  );
}

export default Dashboard;
