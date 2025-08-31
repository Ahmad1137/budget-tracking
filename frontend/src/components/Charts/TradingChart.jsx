import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import api from '../../utils/api';

const TradingChart = ({ type = 'line' }) => {
  const { isDark } = useTheme();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/api/transactions');
        const transactions = res.data;
        
        // Group by month
        const monthlyData = transactions.reduce((acc, t) => {
          const month = new Date(t.date).toLocaleDateString('en-US', { month: 'short' });
          if (!acc[month]) {
            acc[month] = { month, income: 0, expense: 0 };
          }
          if (t.type === 'income') {
            acc[month].income += t.amount;
          } else {
            acc[month].expense += t.amount;
          }
          return acc;
        }, {});
        
        const chartData = Object.values(monthlyData).map(item => ({
          ...item,
          amount: item.income - item.expense
        }));
        
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
    grid: isDark ? '#374151' : '#e5e7eb',
    text: isDark ? '#9ca3af' : '#6b7280'
  };

  if (loading) {
    return <div className="h-[300px] flex items-center justify-center text-gray-500">Loading...</div>;
  }

  if (type === 'candlestick') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
          <XAxis dataKey="month" stroke={colors.text} />
          <YAxis stroke={colors.text} />
          <Tooltip 
            contentStyle={{
              backgroundColor: isDark ? '#1f2937' : '#ffffff',
              border: `1px solid ${colors.grid}`,
              borderRadius: '8px'
            }}
          />
          <Bar dataKey="income" fill={colors.income} radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" fill={colors.expense} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
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
        />
        <Line 
          type="monotone" 
          dataKey="amount" 
          stroke={colors.income} 
          strokeWidth={3}
          dot={{ fill: colors.income, strokeWidth: 2, r: 5 }}
          activeDot={{ r: 8, stroke: colors.income, strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TradingChart;