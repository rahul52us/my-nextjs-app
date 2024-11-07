import {
  Box,
  Flex,
  Heading,
  IconButton,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import {debounce} from 'lodash'
import { observer } from "mobx-react-lite";
import { createContext, useContext } from "react";
import CustomInput from "../CustomInput/CustomInput";
import TableLoader from "./TableLoader";
import { MdAddCircleOutline } from "react-icons/md";
import { RiEditCircleFill } from "react-icons/ri";
import { FcViewDetails } from "react-icons/fc";
import { FiDelete } from "react-icons/fi";
import Pagination from "../pagination/Pagination";

interface DataTableInterface {
  columns: any[];
  data?: any[];
  actions?:any;
}

const TableContext = createContext<any>(null);

const useTableContext = () => useContext(TableContext);

const TableHeaderContainer = () => {
  const {actions : {search}} = useTableContext()


  const handleSearch = debounce((searchTerm: string) => {
    if (search && search.function) {
      search.function(searchTerm);
    }
  }, 800);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleSearch(e.target.value);
  };

  return (
    <Flex mb={3} alignItems="center" justifyContent="space-between">
      <Heading fontSize="sm">My TItle</Heading>
      {
        search && search?.showSearchInput &&
        <Box>
        <CustomInput name="Search" placeholder={search.placeholder} onChange={handleChange}/>
      </Box>
      }
    </Flex>
  );
};
const TableHeader = () => {
  const { columns,actions : {header} } = useTableContext();
  return (
    <Thead h={10}>
      <Tr>
        {columns.map((item: any, index: number) => {
          return <Th key={index}>{item.headerName}</Th>;
        })}
        {
          header && header.show && <Th>{header.text ? header.text : 'Actions'}</Th>
        }
      </Tr>
    </Thead>
  );
};


const Actions = () => {
  const {actions : {addKey, editKey, viewKey, deleteKey }} = useTableContext()
  return (
    <Td>
       <Flex columnGap={2}>
           {addKey?.showAddButton && <IconButton onClick={() => {if(addKey?.function)addKey.function("add")}} size="sm" aria-label="" title={addKey?.title ? addKey?.title : 'Add Data'}><MdAddCircleOutline /></IconButton>}
           {editKey?.showEditButton && <IconButton size="sm" onClick={() => {if(addKey?.function)editKey.function("edit")}} aria-label="" title={editKey?.title ? editKey?.title : 'Edit Data'}><RiEditCircleFill /></IconButton>}
           {viewKey?.showViewButton && <IconButton size="sm" onClick={() => {if(addKey?.function)viewKey.function("view")}} aria-label="" title={viewKey?.title ? viewKey?.title : 'View Data'}><FcViewDetails /></IconButton>}
           {deleteKey?.showDeleteButton && <IconButton size="sm" onClick={() => {if(addKey?.function)deleteKey.function("delete")}} aria-label="" title={deleteKey?.title ? deleteKey?.title : 'Delete Data'}><FiDelete /></IconButton>}
       </Flex>
    </Td>
  )
}

const TableRow = () => {
  const { data, columns } = useContext(TableContext);
  return (
    <TableLoader show={data.length} loader={false}>
      <Tbody>
        {data.map((item: any, index: number) => {
          return (
            <Tr key={index}>
              {columns.map((col: any, index: number) => {
                return <Td key={index}>{item[col.columnName]}</Td>
              })}
              <Actions />
            </Tr>
          );
        })}
      </Tbody>
    </TableLoader>
  );
};

const DataTable = observer(
  ({ columns = [], data = [], actions = {} }: DataTableInterface) => {
    return (
      <TableContext.Provider value={{ columns: columns, data: data, actions : actions }}>
        <TableHeaderContainer />
        <Table className="customTable" variant="striped" size="sm">
          <TableHeader />
          <TableRow />
        </Table>
        <Flex mt={5} justifyContent="center" width="100%">
          <Pagination currentPage={1} totalPages={5} onPageChange={() => {}}/>
          </Flex>
      </TableContext.Provider>
    );
  }
);

export default DataTable;
