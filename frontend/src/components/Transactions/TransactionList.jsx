import api from "../../utils/api";

function TransactionList({ transactions, onDelete }) {
  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/transactions/${id}`);
      onDelete(id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold mb-4">Transactions</h3>
      {transactions.length === 0 ? (
        <p className="text-gray-500">No transactions found</p>
      ) : (
        <div className="space-y-4">
          {transactions.map((t) => (
            <div
              key={t._id}
              className="p-4 bg-white rounded-lg shadow-md flex justify-between"
            >
              <div>
                <p className="font-medium">{t.description || t.category}</p>
                <p className="text-sm text-gray-500">
                  {t.type === "expense" ? "-" : "+"}${t.amount} | {t.category} |{" "}
                  {new Date(t.date).toLocaleDateString()}
                </p>
                {t.walletId && (
                  <p className="text-sm text-gray-500">Wallet: {t.walletId}</p>
                )}
              </div>
              <button
                onClick={() => handleDelete(t._id)}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TransactionList;
