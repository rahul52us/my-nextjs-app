import { Text, Box } from "@chakra-ui/react";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from "chart.js";
import { observer } from "mobx-react-lite";
import { Pie } from "react-chartjs-2";
import "./chart.css";
import SpinnerLoader from "../Loader/SpinnerLoader";

ChartJS.register(Title, Tooltip, ArcElement, Legend);

const PieChart = observer(
  ({ options = {}, data = {}, loading = true }: any) => {
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

    const chartOptions =
      options && Object.keys(options).length ? options : { responsive: true };
    return <Pie options={chartOptions} data={data} />;
  }
);

export default PieChart;