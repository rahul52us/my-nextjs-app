import axios from "axios";
import { action, makeObservable, observable } from "mobx";
import store from "../store";
class CompanyStore {
  companies = {
    data : [],
    loading : false,
    totalPages : 0
  }

  companyCount = {
    data : 0,
    loading : false
  }

  holidays = {
    data: [],
    loading: false,
    hasFetch: false,
    totalPages:0
  };

  workLocations = {
    data: [],
    loading: false,
    hasFetch: false,
    totalPages:0
  };

  workTiming = {
    data: [],
    loading: false
  };

  openTaskDrawer = {
    type: "",
    open: false,
  };

  constructor() {
    makeObservable(this, {
      openTaskDrawer: observable,
      holidays: observable,
      workLocations:observable,
      companyCount:observable,
      workTiming:observable,
      companies:observable,
      createSingleCompany:action,
      getCompanyCount:action,
      getCompanies:action,
      getHolidays: action,
      getWorkLocations:action,
      getWorkTiming:action,
      getPolicies:action,
      updatePolicy:action,
      updateHoliday: action,
      updateClass: action,
      updateWorkTiming:action,
      updateWorkLocation:action,
      updateHolidayByExcel:action,
      updateWorkLocationsByExcel:action,
      updateSingleCompany:action,
      getIndividualPolicy:action
    });
  }

  getCompanyCount = async (sendData: any) => {
    try {
      this.companyCount.loading = true
      const { data } = await axios.get("/company/count", {params : { company:store.auth.getCurrentCompany(),...sendData}});
      this.companyCount.data = data.data
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response || err);
    }
    finally {
      this.companyCount.loading = false
    }
  };

  getIndividualPolicy = async (sendData: any) => {
    try {
      const { data } = await axios.get("/company/policy", {params : { company:store.auth.getCurrentCompany(),...sendData}});
      return data.data;
    } catch (err: any) {
      return Promise.reject(err?.response || err);
    }
    finally {
    }
  };

  createSingleCompany = async (value: any) => {
    try {
      const { token, ...sendData } = value;
      const { data } = await axios.post(
        `/company/single/create`,
        sendData
      );
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err.message);
    }
  };

  updateSingleCompany = async (value: any) => {
    try {
      const { _id, ...sendData } = value;
      const { data } = await axios.put(
        `/company/${_id}`,
        sendData
      );
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err.message);
    }
  };

  updatePolicy = async (sendData: any) => {
    try {
      const { data } = await axios.put("/company/policy", {company:store.auth.getCurrentCompany(),...sendData,});
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response || err);
    }
  };

  updateHoliday = async (sendData: any) => {
    try {
      const { data } = await axios.put("/company/policy/holidays", {company:store.auth.getCurrentCompany(),...sendData,});
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response || err);
    }
  };

  updateHolidayByExcel = async (sendData: any) => {
    try {
      const { data } = await axios.put("/company/policy/holidays/excel", {company:store.auth.getCurrentCompany(),...sendData});
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response || err);
    }
  };

  updateWorkLocationsByExcel = async (sendData: any) => {
    try {
      const { data } = await axios.put("/company/policy/workLocations/excel", {company:store.auth.getCurrentCompany(),...sendData});
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response || err);
    }
  };

  updateWorkTiming = async (sendData: any) => {
    try {
      const { data } = await axios.put("/company/policy/workTiming", {company:store.auth.getCurrentCompany(),...sendData});
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response || err);
    }
  };

  updateWorkLocation = async (sendData: any) => {
    try {
      const { data } = await axios.put("/company/policy/workLocation", {company:store.auth.getCurrentCompany(),...sendData});
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response || err);
    }
  }

  updateClass = async (sendData: any) => {
    try {
      const { data } = await axios.put(`/class/update/${sendData._id}`, sendData);
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  getHolidays = async (sendData: any) => {
    try {
      this.holidays.loading = true
      this.holidays.hasFetch = true
      const { data } = await axios.get("/company/policy/holidays", {params : {company:store.auth.getCurrentCompany(),...sendData}});
      this.holidays.data = data.data || [];
      this.holidays.totalPages = data.data?.totalPages || 0
      return data;
    } catch (err: any) {
      this.holidays.hasFetch = false
      return Promise.reject(err?.response || err);
    } finally {
      this.holidays.loading = false;
    }
  };

  getWorkLocations = async (sendData : any) => {
    try {
        this.workLocations.loading = true;
        this.workLocations.hasFetch = true;

        const { data } = await axios.get("/company/policy/workLocations", {
            params: { company: sendData.company || store.auth.getCurrentCompany(),...sendData }
        });

        this.workLocations.data = data.data || [];
        this.workLocations.totalPages = data.data?.totalPages || 0;
        return data;

    } catch (err: any) {
        this.workLocations.hasFetch = false;
        return Promise.reject(err?.response || err);
    } finally {
        this.workLocations.loading = false;
    }
};


getWorkTiming = async (sendData : any) => {
  try {
    this.workTiming.loading = true
    const { data } = await axios.get("/company/policy/workTiming", {params :  {company: store.auth.getCurrentCompany(),...sendData}});
    this.workTiming.data = data.data || [];
    return data;
  } catch (err: any) {
    return Promise.reject(err?.response || err);
  } finally {
    this.workTiming.loading = false;
};
}

getCompanies = async (sendData : any) => {
  try {
    this.companies.loading = true
    const { data } = await axios.get("/company/companies", {params :  {...sendData,company:store.auth.getCurrentCompany()}});
    this.companies.data = data.data || [];
    return data;
  } catch (err: any) {
    return Promise.reject(err?.response || err);
  } finally {
    this.companies.loading = false;
};
}

getPolicies = async (sendData : any) => {
  try {
    const { data } = await axios.get("/company/policies", {params :  {company:store.auth.getCurrentCompany(),...sendData}});
    return data.data || [];
  } catch (err: any) {
    return Promise.reject(err?.response || err);
  } finally {
};
}
}

export default CompanyStore;
