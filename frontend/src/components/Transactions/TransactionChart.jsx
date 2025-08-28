import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import api from "../../utils/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function TransactionChart() {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const res = await api.get("/api/transactions/charts?period=month");
        const data = {
          labels: ["Income", "Expense"],
          datasets: [
            {
              label: "Amount ($)",
              data: [
                res.data.find((d) => d._id.type === "income")?.total || 0,
                res.data.find((d) => d._id.type === "expense")?.total || 0,
              ],
              backgroundColor: ["#34D399", "#EF4444"],
            },
          ],
        };
        setChartData(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchChartData();
  }, []);

  if (!chartData) return <p>Loading chart...</p>;

  return (
    <div className="mt-6 p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Monthly Transactions</h3>
      <Bar
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: "top",
            },
            title: {
              display: true,
              text: "Income vs Expense",
            },
          },
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        }}
      />
    </div>
  );
}

export default TransactionChart;
