import axios from "axios";
import { action, makeObservable, observable } from "mobx";
import store from "../store";

class Userstore {
  studentDetails: any = {
    data: null,
    loading: true,
    hasFetch: false,
  };
  userRoleCounts : any = {
    loading : false,
    data : []
  }

  classes = {
    data: [],
    loading: false,
    hasFetch: false,
  };

  UsersRoles = {
    data: [],
    loading: false,
    hasFetch: false,
    totalPages: 0,
  }

  managersUsersCount = {
    data : [],
    loading : false
  }

  Users = {
    data: [],
    loading: false,
    hasFetch: false,
    totalPages: 0,
  };

  managerUsers = {
    data: [],
    loading: false,
    hasFetch: false,
    totalPages: 0,
  };

  designationCount = {
    data: [],
    loading: false,
  };

  UsersCounts: any = {
    data: 0,
    loading: false,
  };

  studentDrawerForm = {
    type: "",
    open: false,
  };

  constructor() {
    makeObservable(this, {
      studentDrawerForm: observable,
      studentDetails: observable,
      classes: observable,
      Users: observable,
      designationCount: observable,
      UsersCounts: observable,
      UsersRoles:observable,
      managerUsers:observable,
      managersUsersCount:observable,
      userRoleCounts:observable,
      resetStudentDetails: action,
      setHandleFormDrawer: action,
      getAllManagerUsers:action,
      createUser: action,
      getStudentById: action,
      getAllUsers: action,
      getUsersDetailsById: action,
      updateUserProfile: action,
      getDesignationCount: action,
      getUsersCount: action,
      updateUserBankDetails: action,
      updateFamilyDetails: action,
      updateWorkExperience: action,
      updateDocuments: action,
      updateCompanyDetails:action,
      updatePermissions:action,
      updateQualifications:action,
      getAllUsersRoles:action,
      getManagersUsersCount:action,
      getUsersSubOrdinateDetails:action,
      getUsersSubOrdinateActionsDetails:action,
      getManagersOfUsers:action,
      getUsersRoleCount:action,
      getCompanyDetailsById:action,
      updateSalaryStructure:action,
      getSalaryDetailsStructure:action
    });
  }

  getUsersSubOrdinateDetails = async (sendData: any) => {
    try {
      const { data } = await axios.post("/User/info/Subordinate", { ...sendData, company: store.auth.company },
      );
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response || err);
    } finally {
    }
  };

  getUsersSubOrdinateActionsDetails = async (sendData: any) => {
    try {
      const { data } = await axios.get(`/User/info/Subordinate/${sendData.id}?company=${store.auth.company}`,
      );
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response || err);
    }
  };

  getAllUsers = async (sendData: any) => {
    try {
      this.Users.loading = true;
      const { data } = await axios.post("/User",
       { company: [store.auth.company]},
       { params: { ...sendData },
      });
      this.Users.hasFetch = true;
      this.Users.data = data?.data?.data || [];
      this.Users.totalPages = data?.data?.totalPages || 0;
      return data.data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    } finally {
      this.Users.loading = false;
    }
  };

  getManagersOfUsers = async (sendData: any) => {
    try {
      this.Users.loading = true;
      const { data } = await axios.get(`/User/getManagers/${sendData.user}`, {
        params: { ...sendData, company: store.auth.company },
      });
      return data.data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    } finally {
      this.Users.loading = false;
    }
  };

  getAllManagerUsers = async (sendData: any) => {
    try {
      this.managerUsers.loading = true;
      const { data } = await axios.get(`/User/managers/${sendData.managerId}`, {
        params: { ...sendData, company: store.auth.company },
      });
      this.managerUsers.hasFetch = true;
      this.managerUsers.data = data?.data?.data || [];
      this.managerUsers.totalPages = data?.data?.totalPages || 0;
      return data.data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    } finally {
      this.managerUsers.loading = false;
    }
  };

  getAllUsersRoles = async (sendData: any) => {
    try {
      this.Users.loading = true;
      const { data } = await axios.get("/User/users/roles", {
        params: { ...sendData, company: store.auth.company },
      });
      this.UsersRoles.hasFetch = true;
      this.UsersRoles.data = data?.data?.data || [];
      this.UsersRoles.totalPages = data?.data?.totalPages || 0;
      return data.data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    } finally {
      this.UsersRoles.loading = false;
    }
  };

  getManagersUsersCount = async (sendData: any) => {
    try {
      this.managersUsersCount.loading = true;
      const { data } = await axios.post("/User/managers/Users/count",
        {company: [store.auth.company]},
        {params: { ...sendData }},
      );
      this.managersUsersCount.data = data?.data || [];
      return data.data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    } finally {
      this.managersUsersCount.loading = false;
    }
  };

  getDesignationCount = async () => {
    try {
      this.designationCount.loading = true;
      const { data } = await axios.get("/User/designation/count");
      this.designationCount.data = data?.data || [];
      return data.data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    } finally {
      this.designationCount.loading = false;
    }
  };

  getUsersCount = async () => {
    try {
      this.UsersCounts.loading = true;
      const { data } = await axios.post("/User/total/count",{company : [store.auth.company]});
      this.UsersCounts.data = data?.data || 0;
      return data.data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    } finally {
      this.UsersCounts.loading = false;
    }
  };

  getUsersRoleCount = async () => {
    try {
      this.userRoleCounts.loading = true
      const { data } = await axios.get("/User/get/roles/count",{params : {company: store.auth.company}});
      this.userRoleCounts.data = data.data || []
      return data.data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    } finally {
      this.userRoleCounts.loading = false
    }
  };


  getUsersDetailsById = async (id: any) => {
    try {
      const { data } = await axios.get(`/User/${id}`);
      return data.data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  getSalaryDetailsStructure = async (datas: any) => {
    try {
      const { data } = await axios.post(`/User/salaryStructure`,{user : datas.user});
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  getCompanyDetailsById = async (id: any) => {
    try {
      const { data } = await axios.get(`/User/details/${id}`);
      return data.data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  setHandleFormDrawer = (type: string, data?: any) => {
    this.studentDrawerForm.open = this.studentDrawerForm.open ? false : true;
    this.studentDrawerForm.type = type;
    if (type === "edit") {
      console.log(data);
    } else {
    }
  };

  createUser = async (sendData: any) => {
    try {
      const { data } = await axios.post("User/create", {...sendData, company: store.auth.company});
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response || err);
    }
  };


  updateSalaryStructure = async (sendData: any) => {
    try {
      const { data } = await axios.put(
        `User/salaryStructure/${sendData.id}`,
        sendData
      );
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  updateDocuments = async (id: any, sendData: any) => {
    try {
      const { data } = await axios.put(
        `User/updateDocuments/${id}`,
        sendData
      );
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  updateQualifications = async (id: any, sendData: any) => {
    try {
      const { data } = await axios.put(
        `User/qualifications/${id}`,
        sendData
      );
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  updatePermissions = async (id: any, sendData: any) => {
    try {
      const { data } = await axios.put(
        `User/permissions/${id}`,
        sendData
      );
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  updateUserProfile = async (id: any, sendData: any) => {
    try {
      const { data } = await axios.put(`User/profile/${id}`, {...sendData,company: store.auth.company});
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  updateWorkExperience = async (id: any, sendData: any) => {
    try {
      const { data } = await axios.put(
        `User/workExperience/${id}`,
        sendData
      );
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  updateFamilyDetails = async (id: any, sendData: any) => {
    try {
      const { data } = await axios.put(`User/familyDetails/${id}`, sendData);
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  updateUserBankDetails = async (id: any, sendData: any) => {
    try {
      const { data } = await axios.put(`User/bankDetails/${id}`, sendData);
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  updateCompanyDetails = async (id: any, sendData: any) => {
    try {
      const { data } = await axios.put(`User/companyDetails/${id}`, sendData);
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  getStudentById = async (sendData: any) => {
    try {
      const { data } = await axios.get(`student/${sendData._id}`);
      this.studentDetails.data = data.data;
      this.studentDetails.hasFetch = true;
      return data;
    } catch (err: any) {
      this.studentDetails.hasFetch = false;
      return Promise.reject(err?.response?.data || err);
    } finally {
      this.studentDetails.loading = false;
    }
  };

  resetStudentDetails = async () => {
    this.studentDetails.data = null;
    this.studentDetails.loading = true;
    this.studentDetails.hasFetch = false;
  };
}

export default Userstore;
