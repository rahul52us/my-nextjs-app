import { Grid } from "@chakra-ui/react";
import SideFilterContainer from "../../../../config/component/FilterContainer/SideFilterContainer/SideFilterContainer";
import { observer } from "mobx-react-lite";
import store from "../../../../store/store";
import SkeletanCategoryCard from "../../../../config/component/Card/CategoryCard/SkeletanCategoryCard";
import CourseCard from "../component/CourseCard";
import { coursesData } from "../utils/constant";

interface Props {
  activePage: number;
  setActivePage: any;
  handleCourseClick: any;
}

const CourseCardContainer = observer(
  ({ activePage, setActivePage, handleCourseClick }: Props) => {
    const {
      notesStore: {
        categories: { data, loading },
        localFiltering,
      },
    } = store;

    console.log(activePage, setActivePage);
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
        justifyContent={"space-between"}
      >
        <SideFilterContainer
          data={data}
          loading={loading}
          filtering={localFiltering}
        />
        <Grid
          templateColumns={{
            base: "1fr",
            sm: "1fr",
            md: "1fr 1fr",
            xl: "1fr 1fr 1fr",
          }}
          gap={5}
          justifyContent="space-around"
        >
          {coursesData.map((course: any, index: number) => {
            return (
              <CourseCard
                course={course}
                key={index}
                onClick={() => handleCourseClick(course)}
              />
            );
          })}
          {/* {data.map((item: any, index: any) => {
          return (
            <CategoryCard
              thumbnail={item.thumbnail}
              key={index}
              title={item.title}
              description={item.description}
              username={item?.createdBy?.name}
              userPic={item?.createdBy?.pic}
              discountPrice={item.discountPrice}
              originalPrice={item.originalPrice}
              rating={item.rating}
              totalCount={item?.totalChildData}
            />
          );
        })} */}
          <SkeletanCategoryCard />
        </Grid>
      </Grid>
    );
  }
);

export default CourseCardContainer;
