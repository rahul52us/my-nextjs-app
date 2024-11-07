import { Grid } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import store from "../../../../store/store";
import SideFilterContainer from "../../../../config/component/FilterContainer/SideFilterContainer/SideFilterContainer";
import SkeletanCategoryCard from "../../../../config/component/Card/CategoryCard/SkeletanCategoryCard";
import QuizCategoryCard from "../../../../config/component/Card/CategoryCard/QuizCategoryCard";
import { useEffect } from "react";

const QuizCategoryContainer = observer(({ handleClick }: any) => {
  const {
    quiz: {
      dashQuiz: { hasFetch, data, loading },
      getDashQuiz,
    },
    auth : {openNotification}
  } = store;

  useEffect(() => {
    if (!hasFetch) {
      getDashQuiz()
        .then(() => {})
        .catch((err) => {
          openNotification({ message: err.message, title: "Get Quiz Failed" });
        });
    }
  }, [hasFetch, getDashQuiz, openNotification]);

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
        data={data.quiz || []}
        loading={loading}
        filtering={() => {}}
      />
      <Grid
        templateColumns={{
          base: "1fr",
          sm: "1fr",
          md: "1fr",
          lg: "1fr 1fr",
          xl: "1fr 1fr 1fr",
        }}
        gap={5}
      >
        {data?.quiz && data?.quiz?.map((item: any, index: any) => {
          return (
            <QuizCategoryCard
              item={item}
              thumbnail={item.thumbnail?.url}
              key={index}
              title={item.title}
              description={item.description}
              username={item?.createdBy?.name}
              userPic={item?.createdBy?.pic}
              discountPrice={item.discountPrice}
              originalPrice={item.originalPrice}
              rating={item.rating}
              totalCount={item?.totalChildData}
              handleClick={handleClick}
            />
          );
        })}
        {loading && (
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

export default QuizCategoryContainer;
