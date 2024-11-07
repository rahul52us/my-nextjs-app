import axios from "axios";
import { action, makeObservable } from "mobx";

class OrganisationStore {
  constructor() {
    makeObservable(this, {
      filterOrganisations: action,
      createOrganisationUser: action,
      getCompanyDetailsByName:action
    });
  }

  filterOrganisations = async (searchValue: string) => {
    try {
      const { data } = await axios.get(
        `/company/search?company=${searchValue}`
      );
      return data;
    } catch (err: any) {
      console.log(err)
      return Promise.reject(err?.response?.data || err);
    }
  };

  createOrganisationUser = async (value: any) => {
    try {
      const { data } = await axios.post("/auth/create", value);
      return data.data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err?.message);
    }
  }

  getCompanyDetailsByName = async (value : any) => {
    try
    {
      const { data } = await axios.get(`/company/details?company=${value}`);
      console.log(data)
      return data.data;
    }
    catch(err : any)
    {
      return Promise.reject(err?.response?.data || err?.message);
    }
  }
}

export default OrganisationStore;
