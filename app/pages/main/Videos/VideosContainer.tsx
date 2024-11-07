import { Grid } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import store from "../../../store/store";
import SideFilterContainer from "../../../config/component/FilterContainer/SideFilterContainer/SideFilterContainer";
import VideoCategoryCard from "../../../config/component/Card/CategoryCard/VideoCategoryCard";
import SkeletanCategoryCard from "../../../config/component/Card/CategoryCard/SkeletanCategoryCard";

const VideosContainer = observer(({ handleClick }: any) => {
  const {
    VideoStore: { categories },
  } = store;

  return (
    <Grid
      templateColumns={{
        base: "1fr",
        sm: "1fr",
        md: "1fr 2fr",
        lg: "1fr 4fr",
      }}
      gap={4}
      columnGap={3}
    >
      <SideFilterContainer
        data={categories.data || []}
        loading={categories.loading}
        filtering={() => {}}
      />
      <Grid
        templateColumns={{
          base: "1fr",
          sm: "1fr",
          md: "1fr 1fr",
          lg: "1fr 1fr 1fr 1fr",
          xl: "1fr 1fr 1fr 1fr",
        }}
        gap={5}
      >
        {categories.data.map((item: any, index: number) => (
          <VideoCategoryCard
            link={item?.description}
            item={item}
            key={index}
            handleClick={handleClick}
          />
        ))}
        {categories.loading && (
          <>
            <SkeletanCategoryCard />
            <SkeletanCategoryCard />
            <SkeletanCategoryCard />
            <SkeletanCategoryCard />
          </>
        )}
      </Grid>
    </Grid>
  );
});

export default VideosContainer;
