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

function BudgetChart() {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const res = await api.get("/api/budgets?year=2025&month=8");
        const data = {
          labels: res.data.map((b) => b.category),
          datasets: [
            {
              label: "Budget",
              data: res.data.map((b) => b.amount),
              backgroundColor: "#34D399",
            },
            {
              label: "Spent",
              data: res.data.map((b) => b.spent),
              backgroundColor: "#EF4444",
            },
          ],
        };
        setChartData(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBudgets();
  }, []);

  if (!chartData) return <p>Loading chart...</p>;

  return (
    <div className="mt-6 p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Budget vs Spending</h3>
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
              text: "Budget vs Spending",
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

export default BudgetChart;
