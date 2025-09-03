import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import api from '../../utils/api';

const MonthlyTransactionChart = () => {
  const { isDark } = useTheme();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/api/transactions');
        const transactions = res.data;
        
        if (!transactions || transactions.length === 0) {
          setData([]);
          return;
        }
        
        const monthlyData = transactions.reduce((acc, t) => {
          if (!t || !t.date) return acc;
          const month = new Date(t.date).toLocaleDateString('en-US', { month: 'short' });
          if (!acc[month]) {
            acc[month] = { month, income: 0, expense: 0 };
          }
          if (t.type === 'income') {
            acc[month].income += (t.amount || 0);
          } else {
            acc[month].expense += (t.amount || 0);
          }
          return acc;
        }, {});
        
        const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const chartData = Object.values(monthlyData)
          .sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month))
          .map(item => ({
            ...item,
            balance: item.income - item.expense
          }));
        
        if (chartData.length === 0) {
          const currentMonth = new Date().toLocaleDateString('en-US', { month: 'short' });
          chartData.push({ month: currentMonth, balance: 0 });
        }
        
        setData(chartData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const colors = {
    income: '#10b981',
    expense: '#ef4444',
    total: '#3b82f6',
    grid: isDark ? '#374151' : '#e5e7eb',
    text: isDark ? '#9ca3af' : '#6b7280'
  };

  if (loading) {
    return <div className="h-[300px] flex items-center justify-center text-gray-500">Loading...</div>;
  }
  
  if (data.length === 0) {
    return <div className="h-[300px] flex items-center justify-center text-gray-500">No data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
        <XAxis dataKey="month" stroke={colors.text} />
        <YAxis stroke={colors.text} />
        <Tooltip 
          contentStyle={{
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            border: `1px solid ${colors.grid}`,
            borderRadius: '8px'
          }}
          formatter={(value) => [`$${value.toFixed(2)}`, 'Balance']}
        />
        <Line 
          type="monotone" 
          dataKey="balance" 
          stroke={colors.total} 
          strokeWidth={3}
          dot={{ fill: colors.total, strokeWidth: 2, r: 5 }}
          activeDot={{ r: 8, stroke: colors.total, strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default MonthlyTransactionChart;