import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import store from "../../../store/store";
import IndividualMain from "./IndividualMain/IndividualMain";
import IndividualRight from "./IndividualRight/IndividualRight";
import { Grid, GridItem, useColorModeValue } from "@chakra-ui/react";
import { useParams } from "react-router-dom";

const IndividualCompanyHome = observer(() => {
  const {Organisation : {getCompanyDetailsByName}} = store;
  const {individualCompany} = useParams()
  const borderColor = useColorModeValue("#f0f0f0", "teal.700");

  useEffect(() => {
    getCompanyDetailsByName(individualCompany?.split('-')?.join(' ')).then((data : any) => {
      console.log(data)
    }).catch((err : any) => {
      alert(err.message)
    })
  }, [getCompanyDetailsByName,individualCompany])

  return (
    <Grid gridTemplateColumns={{ base: "1fr", md: "2fr 1fr" }} px={{ md: 3 }}>
      <GridItem borderRight={`1px solid ${borderColor}`}>
        <IndividualMain />
      </GridItem>
      <GridItem>
        <IndividualRight />
      </GridItem>
    </Grid>
  );
});

export default IndividualCompanyHome;