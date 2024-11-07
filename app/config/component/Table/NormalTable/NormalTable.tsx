import {
  Box,
  Flex,
  Heading,
  Input,
  Spinner,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useBreakpointValue,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import Pagination from "../../pagination/Pagination";
import TableLoader from "../../DataTable/TableLoader";

interface Column {
  headerName: string;
  key: string;
}

interface NormalTableProps {
  data: any[];
  title?: string;
  loading?: boolean;
  totalPages: number;
  onPageChange: any;
  currentPage: number;
  onSearchChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  searchValue?: string;
  columns: Column[];
}

const NormalTable = ({
  data,
  title,
  loading,
  totalPages,
  currentPage,
  onPageChange,
  onSearchChange,
  searchValue,
  columns,
}: NormalTableProps) => {
  const {colorMode} = useColorMode()
  const columnWidth = useBreakpointValue({
    base: "100%",
    sm: "25%",
    md: "15%",
    lg: "12.5%",
  });
  const cellHeight = "40px";
  const bgColor = useColorModeValue("gray.200", "gray.700");
  const headerColor = useColorModeValue("gray.100", "gray.700");
  const textColor = useColorModeValue("black", "white");
  // const borderColor = useColorModeValue(
  //   "transparent",
  //   "1px solid darkgray"
  // );
  const tableHeaderBg = useColorModeValue("gray.400", "blackAlpha.300");

  return (
    <Box shadow={'base'} borderWidth={1} rounded={'lg'} mt={5} overflowX="auto">
      <Flex
        justifyContent="space-between"
        alignItems="center"
        // borderBottom={borderColor}
        p={2}
        height={50}
        bg={headerColor}
      >
        <Heading fontSize="md" color={textColor}>
          {title ? title : "Recent Users"}
        </Heading>
        <Box>
          <Input
            placeholder="Search"
            fontSize="sm"
            value={searchValue}
            onChange={onSearchChange}
          />
        </Box>
      </Flex>
      <Box p={1} height={{ sm: "325px" }} overflowY="auto" maxWidth="100%">
        <Table variant="simple" width="100%"  size="sm">
          <Thead>
            <Tr bg={tableHeaderBg} height={cellHeight}>
              {columns.map((column, index) => (
                <Th
                  key={index}
                  width={columnWidth}
                  color={textColor}
                  // border={borderColor} 
                  textAlign="center"
                >
                  {column.headerName}
                </Th>
              ))}
            </Tr>
          </Thead>
          <TableLoader show={data.length} loader={loading || false}>
            <Tbody>
              {loading ? (
                <Tr>
                  <Td colSpan={columns.length} textAlign="center">
                    <Spinner />
                  </Td>
                </Tr>
              ) : (
                data.map((row: any, rowIndex: number) => (
                  <Tr
                    key={rowIndex}
                    bg={rowIndex % 2 === 0 ? bgColor : colorMode === "light" ? "white" : "gray.800"}
                    height={cellHeight}
                  >
                    {columns.map((column, colIndex) => (
                      <Td
                        key={colIndex}
                        width={columnWidth}
                        color={textColor}
                        // border={borderColor}
                        textAlign="center"
                        minW={115}
                      >
                        {row[column.key]}
                      </Td>
                    ))}
                  </Tr>
                ))
              )}
            </Tbody>
          </TableLoader>
        </Table>
      </Box>
      <Flex
        justifyContent="end"
        alignItems="center"
        p={2}
        // height={cellHeight}
        // borderTop={borderColor}
        bg={headerColor}
      >
        <Box>
          <Pagination
            currentPage={currentPage}
            onPageChange={onPageChange}
            totalPages={totalPages}
          />
        </Box>
      </Flex>
    </Box>
  );
};

export default NormalTable;
