import { useEffect, useState } from "react";
import api from "../utils/api";
import TransactionForm from "../components/Transactions/TransactionForm";
import TransactionList from "../components/Transactions/TransactionList";

function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [wallets, setWallets] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [transRes, walletsRes] = await Promise.all([
          api.get("/api/transactions"),
          api.get("/api/wallets"),
        ]);
        setTransactions(transRes.data);
        setWallets(walletsRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleAdd = (transaction) => {
    setTransactions([transaction, ...transactions]);
  };

  const handleDelete = (id) => {
    setTransactions(transactions.filter((t) => t._id !== id));
  };

  return (
    <div className="container mx-auto mt-10">
      <h2 className="text-3xl font-bold mb-6">Transactions</h2>
      <TransactionForm wallets={wallets} onAdd={handleAdd} />
      <TransactionList transactions={transactions} onDelete={handleDelete} />
    </div>
  );
}

export default TransactionsPage;
