import { useEffect, useState } from "react";
import api from "../utils/api";
import WalletForm from "../components/Wallets/WalletForm";
import WalletList from "../components/Wallets/WalletList";

function WalletsPage() {
  const [wallets, setWallets] = useState([]);

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const res = await api.get("/api/wallets");
        setWallets(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchWallets();
  }, []);

  const handleAdd = (wallet) => {
    setWallets([wallet, ...wallets]);
  };

  return (
    <div className="container mx-auto mt-10">
      <h2 className="text-3xl font-bold mb-6">Wallets</h2>
      <WalletForm onAdd={handleAdd} />
      <WalletList wallets={wallets} />
    </div>
  );
}

export default WalletsPage;
