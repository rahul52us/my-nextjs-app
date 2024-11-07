import { Spinner, Text, Box } from "@chakra-ui/react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { observer } from "mobx-react-lite";
import { Bar } from "react-chartjs-2";
import './chart.css'

const defaultData = {
  datasets: [
    {
      label: 'Default Dataset 1',
      data: [10, 20, 30, 40, 50], // Default data values
      backgroundColor: 'rgba(54, 162, 235, 0.5)', // Default background color
    },
    {
      label: 'Default Dataset 2',
      data: [20, 30, 40, 50, 60], // Default data values
      backgroundColor: 'rgba(255, 99, 132, 0.5)', // Different color
    },
    {
      label: 'Default Dataset 3',
      data: [30, 40, 50, 60, 70], // Default data values
      backgroundColor: 'rgba(75, 192, 192, 0.5)', // Different color
    },
    {
      label: 'Default Dataset 4',
      data: [12, 40, 50, 60, 110], // Default data values
      backgroundColor: 'rgba(75, 172, 195, 0.5)', // Different color
    },
  ],
  labels: ['January', 'February', 'March', 'April', 'May'] // Default labels
};


const BarChart = observer(
  ({ options = {}, data = [], loading = true }: any) => {
    ChartJS.register(
      CategoryScale,
      LinearScale,
      BarElement,
      Title,
      Tooltip,
      Legend
    );

    if (loading) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
          background="#F0F0F0"
          borderRadius="4px"
          boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
        >
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            padding="20px"
          >
            <Spinner color="blue.500" thickness="4px" size="lg" />
            <Text
              color="#333"
              fontSize="sm"
              marginTop={2}
              fontWeight="bold"
              style={{
                animation: "text-fade 1s ease-in-out infinite",
              }}
            >
              Loading Data...
            </Text>
          </Box>
        </Box>
      );
    }

    const chartOptions =
      options && Object.keys(options).length ? options : { responsive: true };
    const chartData = data && Object.keys(data).length > 0 ? data : defaultData;
    return <Bar options={chartOptions} data={chartData} />;
  }
);

export default BarChart;
