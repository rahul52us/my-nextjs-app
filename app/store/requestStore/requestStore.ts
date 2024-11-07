import axios from "axios";
import { action, makeObservable, observable } from "mobx";
import store from "../store";

class RequestStore {
  studentDetails : any = {
    data : null,
    loading:true,
    hasFetch:false
  }

  classes = {
    data: [],
    loading: false,
    hasFetch: false,
  };

  departmentCategories = {
    data: [],
    loading: false,
    hasFetch: false,
    totalPages:0
  };

  departments = {
    data: [],
    loading: false,
    hasFetch: false,
    totalPages:0
  };

  departmentCounts = {
    data : 0,
    loading : false
  }

  UsersCounts : any = {
    data : 0,
    loading : false
  }

  studentDrawerForm = {
    type: "",
    open: false,
  };

  constructor() {
    makeObservable(this, {
      studentDrawerForm: observable,
      studentDetails:observable,
      classes: observable,
      departmentCategories:observable,
      departmentCounts:observable,
      departments:observable,
      resetStudentDetails:action,
      getAllRequest: action,
      getRequestById:action,
      getPositionCount:action,
      getDepartmentCounts:action,
      getAllDepartment:action,
      deleteDepartment:action,
      deleteDepartmentCategory:action,
      createRequest:action,
      updateDepartmentCategory:action,
      addDepartment:action,
      updateDepartment:action,
      updateRequest:action,
      deleteRequest:action
    });
  }

  getAllRequest = async (sendData : any) => {
    try {
      this.departmentCategories.loading = true
      const { data } = await axios.get("/request",{params : {company : store.auth.getCurrentCompany(), ...sendData}});
      this.departmentCategories.hasFetch = true
      this.departmentCategories.data = data?.data?.data || [];
      this.departmentCategories.totalPages = data?.data?.totalPages || 0
      return data.data
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    } finally {
      this.departmentCategories.loading = false;
    }
  };

  createRequest = async (sendData : any) => {
    try {
      const { data } = await axios.post("/request/create",{company : store.auth.getCurrentCompany(), ...sendData});
      return data
    } catch (err: any) {
      return Promise.reject(err?.response || err);
    }
  };

  updateRequest = async (sendData : any) => {
    try {
      const { data } = await axios.put(`/request/${sendData._id}`,{company : store.auth.getCurrentCompany(), ...sendData});
      return data
    } catch (err: any) {
      return Promise.reject(err?.response || err);
    }
  };

  deleteRequest = async (sendData : any) => {
    try {
      const { data } = await axios.delete(`/request/${sendData._id}`,{company : store.auth.getCurrentCompany(), ...sendData});
      return data
    } catch (err: any) {
      return Promise.reject(err?.response || err);
    }
  };


  getRequestById = async (sendData : any) => {
    try {
      const { data } = await axios.get(`/request/${sendData._id}`,{company : store.auth.getCurrentCompany(), ...sendData});
      return data
    } catch (err: any) {
      return Promise.reject(err?.response || err);
    }
  };

  addDepartment = async (sendData : any) => {
    try {
      const { data } = await axios.post("/department",{company : store.auth.getCurrentCompany(), ...sendData});
      return data
    } catch (err: any) {
      return Promise.reject(err?.response || err);
    }
  };

  getAllDepartment = async (id : string, sendData: any) => {
    try {
      this.departments.loading = true
      const { data } = await axios.get(`/department/${id}`,{params : {id : id, company : store.auth.getCurrentCompany(), ...sendData}});
      this.departments.hasFetch = true
      this.departments.data = data?.data?.data || [];
      this.departments.totalPages = data?.data?.totalPages || 0
      return data.data
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    } finally {
      this.departments.loading = false;
    }
  };

  deleteDepartment = async (id : string) => {
    try {
      const { data } = await axios.delete(`department/${id}`);
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  }

  deleteDepartmentCategory = async (id : string) => {
    try {
      const { data } = await axios.delete(`department/category/${id}`);
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  }

  updateDepartmentCategory = async (id : string, sendData : any) => {
    try {
      const { data } = await axios.put(`department/category/${id}`,{...sendData,company : store.auth.getCurrentCompany()});
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response || err);
    }
  }

  updateDepartment = async (id : string, sendData : any) => {
    try {
      const { data } = await axios.put(`/department/${id}`,{...sendData,company : store.auth.getCurrentCompany()});
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response || err);
    }
  }

  getPositionCount = async () => {
    try {
      this.departmentCounts.loading = true
      const { data } = await axios.get("/department/categories/count");
      this.departmentCounts.data = data?.data || [];
      return data.data
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    } finally {
      this.departmentCounts.loading = false;
    }
  };

  getDepartmentCounts = async () => {
    try {
      this.departmentCounts.loading = true
      const { data } = await axios.get("/department/categories/count",{params : {company : store.auth.getCurrentCompany()}});
      this.departmentCounts.data = data?.data || 0;
      return data.data
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    } finally {
      this.departmentCounts.loading = false;
    }
  };

  resetStudentDetails = async () => {
    this.studentDetails.data = null;
    this.studentDetails.loading = true
    this.studentDetails.hasFetch = false
  }
}

export default RequestStore;
