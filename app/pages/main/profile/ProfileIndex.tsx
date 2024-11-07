import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import store from "../../../store/store";
import MyProfile from "./MyProfile/MyProfile";
import PageLoader from "../../../config/component/Loader/PageLoader";

const ProfileIndex = observer(() => {
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const {
    User: { getUsersDetailsById },
    auth: { user },
  } = store;

  useEffect(() => {
    if (user) {
      setLoading(true);
      getUsersDetailsById(user._id)
        .then((data) => {
          setUserDetails(data);
        })
        .catch(() => {})
        .finally(() => {
          setLoading(false);
        });
    }
  }, [getUsersDetailsById, user]);


  return (
    <PageLoader loading={loading} noRecordFoundText={!user}>
      {userDetails && user && (
        <MyProfile userDetails={userDetails} user={user} />
      )}
    </PageLoader>
  );
});

export default ProfileIndex;
