import axios from "axios";
import { action, makeObservable, observable } from "mobx";
import { format } from "date-fns";
import store from "../store";

class AttendencePunchStore {
  recentPunch = {
    data: [],
    loading: false,
  };

  constructor() {
    makeObservable(this, {
      recentPunch: observable,
      handlePunch: action,
      getRecentPunch: action,
    });
  }

  getRecentPunch = async (sendData: any) => {
    try {
      this.recentPunch.data = [];
      this.recentPunch.loading = true;
      const { data } = await axios.get("/attendenceRequest", {
        params: { ...sendData, company: store.auth.getCurrentCompany() },
      });
      this.recentPunch.data = data?.data || [];
      return data?.data;
    } catch (err: any) {
      return Promise.reject(err?.response || err);
      // Handle error as needed
    } finally {
      this.recentPunch.loading = false;
    }
  };

  handlePunch = async (sendData: any) => {
    try {
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const formatDate = (date: any) => format(date, "yyyy-MM-dd");

      const { data } = await axios.put("/attendenceRequest", sendData);
      this.getRecentPunch({
        startDate: formatDate(today),
        endDate: formatDate(tomorrow),
        company : store.auth.getCurrentCompany()
      });
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response || err);
    } finally {
    }
  };
}

export default AttendencePunchStore;
