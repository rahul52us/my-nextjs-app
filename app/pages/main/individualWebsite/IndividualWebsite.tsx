import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import store from "../../../store/store";
import { useParams } from "react-router-dom";
import School from "../School/School";
import WebLoader from "../../../config/component/Loader/WebLoader";
import { Center, Image } from "@chakra-ui/react";

interface FetchData {
  loading: boolean;
  data: any;
  webType: string;
}

const IndividualWebsite = observer(() => {
  const { title } = useParams();

  const {
    auth: { openNotification },
    WebTemplateStore: { getWebTemplate },
  } = store;

  const [fetchData, setFetchData] = useState<FetchData>({
    loading: true,
    data: null,
    webType: "notFound",
  });

  useEffect(() => {
    setFetchData({ loading: true, data: null, webType: "notFound" });
    getWebTemplate(title)
      .then((dt: any) => {
        const webType = dt?.data?.webType || "notFound";
        setFetchData({ loading: false, data: dt.data, webType });
      })
      .catch(() => {
        setFetchData({ loading: false, data: null, webType: "notFound" });
      });
  }, [openNotification, getWebTemplate, title]);

  const renderContent = () => {
    if (fetchData.webType === "school" && Object.keys(fetchData.data || {}).length > 0) {
      return <School dt={fetchData} />;
    } else if (fetchData.webType === "business" && Object.keys(fetchData.data || {}).length > 0) {
      return <div>Business Component Placeholder</div>;
    } else if (fetchData.webType === "portfolios" && Object.keys(fetchData.data || {}).length > 0) {
      return <div>Portfolio Component Placeholder</div>;
    } else {
      return (
        <Center mt={"25vh"}>
          <Image
            src="/img/emptyData.jpg"
            alt=""
            w={350}
            h={350}
            borderRadius={50}
          />
        </Center>
      );
    }
  };

  return <div>{fetchData.loading ? <WebLoader /> : renderContent()}</div>;
});

export default IndividualWebsite;
