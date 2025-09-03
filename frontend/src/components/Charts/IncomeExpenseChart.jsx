import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import api from '../../utils/api';

const IncomeExpenseChart = () => {
  const { isDark } = useTheme();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const transactionsRes = await api.get('/api/transactions');
        const transactions = transactionsRes.data || [];
        
        const chartData = transactions.map((transaction, index) => ({
          id: index + 1,
          amount: transaction.amount || 0,
          type: transaction.type || 'expense',
          income: transaction.type === 'income' ? (transaction.amount || 0) : 0,
          expense: transaction.type === 'expense' ? (transaction.amount || 0) : 0
        }));
        
        setData(chartData);
      } catch (err) {
        console.error('Failed to fetch chart data:', err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const colors = {
    budget: '#10b981',
    spent: '#ef4444',
    grid: isDark ? '#374151' : '#e5e7eb',
    text: isDark ? '#9ca3af' : '#6b7280'
  };

  if (loading) {
    return <div className="h-[300px] flex items-center justify-center text-gray-500">Loading...</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} barCategoryGap={1}>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
        <XAxis dataKey="id" stroke={colors.text} />
        <YAxis stroke={colors.text} />
        <Tooltip 
          contentStyle={{
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            border: `1px solid ${colors.grid}`,
            borderRadius: '8px'
          }}
          formatter={(value, name) => value > 0 ? [`$${value.toFixed(2)}`, name === 'income' ? 'Income' : 'Expense'] : null}
        />
        <Bar dataKey="income" fill={colors.budget} maxBarSize={8} />
        <Bar dataKey="expense" fill={colors.spent} maxBarSize={8} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default IncomeExpenseChart;