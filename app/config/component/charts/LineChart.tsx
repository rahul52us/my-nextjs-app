import { Box, Text } from "@chakra-ui/react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
} from "chart.js";

import { Line } from "react-chartjs-2";
import SpinnerLoader from "../Loader/SpinnerLoader";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LineGraph = ({ options = {}, data = {}, loading = false }: any) => {
  const defaultData = {
    datasets: [
      {
        label: "Default Dataset 1",
        data: [10, 20, 30, 40, 50], // Default data values
        backgroundColor: "rgba(54, 162, 235, 0.5)", // Default background color
      },
      {
        label: "Default Dataset 2",
        data: [20, 30, 40, 50, 60], // Default data values
        backgroundColor: "rgba(255, 99, 132, 0.5)", // Different color
      },
      {
        label: "Default Dataset 3",
        data: [30, 45, 25, 15, 70], // Default data values
        backgroundColor: "rgba(75, 192, 192, 0.5)", // Different color
      },
      {
        label: "Default Dataset 4",
        data: [12, 40, 50, 60, 110], // Default data values
        backgroundColor: "rgba(85, 172, 195, 0.5)", // Different color
      },
    ],
    labels: ["January", "February", "March", "April", "May"],
  };

  data = {
    labels: defaultData.labels,
    datasets: defaultData.datasets,
  };

  options = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Line Chart",
      },
    },
  };

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
          <SpinnerLoader />
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

  return <Line options={options} data={data} />;
};

export default LineGraph;
