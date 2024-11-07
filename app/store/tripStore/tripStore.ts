import axios from "axios";
import { action, makeObservable, observable } from "mobx";
import store from "../store";
import { formatCurrency } from "../../config/constant/function";

class TripStore {
  trips : any = {
    data : [],
    loading : false,
    hasFetch : false,
    totalPages : 1
  }

  searchModel = {
    open : false,
    type : 'trip'
  }

  tripChartCount : any = {
    data : [],
    loading : false,
    hasFetch : false
  }

  tripCount : any = {
    data : 0,
    loading : false,
    hasFetch : false
  }

  tripTypeCount : any = {
    data : [],
    loading : false,
    hasFetch : false
  }

  userTripTypeCount : any = {
    data : {},
    loading : false,
    hasFetch : false
  }

  tripTitleAmount : any = {
    data : [],
    loading : false
  }

  totalTripAmount : any = {
    data : 0,
    loading : false
  }

  constructor() {
    makeObservable(this, {
      trips : observable,
      tripChartCount: observable,
      tripCount:observable,
      userTripTypeCount:observable,
      tripTypeCount:observable,
      tripTitleAmount:observable,
      totalTripAmount:observable,
      searchModel:observable,
      createTrip: action,
      updateTrip:action,
      getTripChartCounts:action,
      getTripCounts:action,
      getSingleTrip:action,
      getUserTripTypeCounts:action,
      getTripTypesCounts:action,
      addTripMembers:action,
      getTripTitleAmount:action,
      getTotalTripAmount:action,
      getIndividualTripAmount:action,
      setOpenSearchTrip:action,
      getIndividualTrip:action
    });
  }

  addTripMembers = async (sendData: any) => {
    try {
      const { data } = await axios.put(`/trip/add/member/${sendData._id}`, {
        ...sendData,
        company: store.auth.getCurrentCompany(),
      });
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response || err);
    }
  };

  createTrip = async (sendData : any) => {
    try {
      const { data } = await axios.post("trip/create", {...sendData,company : store.auth.getCurrentCompany()});
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response || err);
    }
  }

  updateTrip = async (sendData : any,id : any) => {
    try {
      const { data } = await axios.put(`trip/${id}`, sendData);
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response || err);
    }
  }

  getIndividualTrip = async (sendData : any = {}) => {
    try {
      const { data } = await axios.post(`/trip/individual/${sendData.tripId}`,{company : [store.auth.getCurrentCompany()],...sendData});
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response || err);
    } finally {
    }
  }

  getSingleTrip = async (sendData : any) => {
    try {
      const { data } = await axios.get(`trip/single/${sendData._id}`);
      return data.data || {};
    } catch (err: any) {
      return Promise.reject(err?.response || err);
    }
  }

  getAllTrip = async (sendData : any) => {
    try {
      this.trips.loading = true;
      const { data } = await axios.post("/trip", {company : [store.auth.getCurrentCompany()], ...sendData},{params : {...sendData}}, );
      this.trips.data = data?.data?.data || [];
      this.trips.totalPages = data?.data?.totalPages || 0
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response || err);
    } finally {
      this.trips.loading = false;
    }
  };

  getTripChartCounts = async (sendData : any = {}) => {
    try {
      this.tripChartCount.loading = true;
      const { data } = await axios.post(`/trip/tripcounts`, {company : [store.auth.getCurrentCompany()],...sendData});
      this.tripChartCount.data = data?.data
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response || err);
    } finally {
      this.tripChartCount.loading = false;
    }
  }

  getTripCounts = async (sendData :any = {}) => {
    try {
      this.tripCount.loading = true;
      const { data } = await axios.post(`/trip/total/count`,{company : [store.auth.getCurrentCompany()], ...sendData});
      this.tripCount.data = data?.data || 0
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response || err);
    } finally {
      this.tripCount.loading = false;
    }
  }

  getTripTypesCounts = async (sendData : any = {}) => {
    try {
      this.tripTypeCount.loading = true;
      const { data } = await axios.post(`/trip/types/total/count`, { company: [store.auth.getCurrentCompany()],...sendData });
        const transformedData = data?.data && data.data.reduce((acc : any, item : any) => {
        acc[item.title] = item.count;
        return acc;
      }, {});
      this.tripTypeCount.data = transformedData || {};
      return data;
    } catch (err : any) {
      return Promise.reject(err?.response || err);
    } finally {
      this.tripTypeCount.loading = false;
    }
  }


  getUserTripTypeCounts = async (sendData : any = {}) => {
    try {
      this.userTripTypeCount.loading = true;
      const { data } = await axios.post(`/trip/types/total/count`,{company : [store.auth.getCurrentCompany()], ...sendData});
      const transformedData = data?.data && data.data.reduce((acc : any, item : any) => {
        acc[item.title] = item.count;
        return acc;
      }, {});
      this.userTripTypeCount.data = transformedData || {};
      return this.userTripTypeCount.data;
    } catch (err: any) {
      return Promise.reject(err?.response || err);
    } finally {
      this.userTripTypeCount.loading = false;
    }
  }

  getTripTitleAmount = async (sendData : any = {}) => {
    try {
      this.tripTitleAmount.loading = true;
      const { data } = await axios.post(`/trip/calculate/title/amount`,{company : [store.auth.getCurrentCompany()],...sendData});
      this.tripTitleAmount.data = data?.data.map((it : any) => ({...it, count : formatCurrency(it.amount)})) || []
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response || err);
    } finally {
      this.tripTitleAmount.loading = false;
    }
  }

  getTotalTripAmount = async (sendData : any = {}) => {
    try {
      this.totalTripAmount.loading = true;
      const { data } = await axios.post(`/trip/calculate/amount`,{company : [store.auth.getCurrentCompany()], ...sendData});
      this.totalTripAmount.data = data?.data || []
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response || err);
    } finally {
      this.totalTripAmount.loading = false;
    }
  }

  getIndividualTripAmount = async (sendData : any) => {
    try {
      const { data } = await axios.post(`/trip/calculate/individual/amount`,{company : [store.auth.getCurrentCompany()],...sendData});
      return data?.data || []
    } catch (err: any) {
      return Promise.reject(err?.response || err);
    }
  }

  setOpenSearchTrip = async (data : any) => {
    try {
      this.searchModel.open = data.open ? true : false
      this.searchModel.type = data?.type ? data?.type : 'trip'
    } catch (err: any) {
      return Promise.reject(err?.response || err);
    }
  }
}

export default TripStore;