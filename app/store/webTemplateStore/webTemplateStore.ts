import axios from 'axios';
import { makeObservable, observable, action } from 'mobx';
import store from '../store';

class WebTemplateStore {
  web = null;
  webTemplates = {
    data : [],
    loading : false,
    totalPages : 0
  }
  constructor() {
    makeObservable(this, {
      web: observable,
      webTemplates:observable,
      getWeb: action,
      createWebTemplate:action,
      getWebTemplate:action,
      updateWebTemplate:action,
      getAllWebTemplate:action
    });
  }

  getWeb = async (webName : any) => {
    if (localStorage.getItem(process.env.REACT_APP_WEB_INFO_KEY!)) {
      this.web = JSON.parse(localStorage.getItem(process.env.REACT_APP_WEB_INFO_KEY || '') || '{}');
      return this.web
    } else {
      try {
        const { data } = await axios.get(`web/get/${webName}`);
        this.web = data.data;
        localStorage.setItem(process.env.REACT_APP_WEB_INFO_KEY!,  JSON.stringify(data.data));
        return this.web;
      } catch (err : any) {
        localStorage.removeItem(process.env.REACT_APP_WEB_INFO_KEY!)
        return Promise.reject(err?.response?.data);
      }
    }
  };

  createWebTemplate = async (sendData : any) => {
    try {
      const { data } = await axios.post("/webTemplate/create", {...sendData,company : store.auth.getCurrentCompany()});
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response || err);
    }
  }

  getAllWebTemplate = async (sendData : any) => {
    try {
      this.webTemplates.loading = true
      const { data } = await axios.post("/webTemplate", {...sendData,company : store.auth.getCurrentCompany()});
      this.webTemplates.data = data?.data?.data || []
      this.webTemplates.totalPages = data?.data?.totalPages
      this.webTemplates.loading = false
      return data;
    } catch (err: any) {
      this.webTemplates.loading = false
      return Promise.reject(err?.response || err);
    }
  }

  updateWebTemplate = async (sendData : any) => {
    try {
      const { data } = await axios.put("/webTemplate", {...sendData,company : store.auth.getCurrentCompany()});
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response || err);
    }
  }

  getWebTemplate = async (templateName : any) => {
    try {
      const { data } = await axios.get(`/webTemplate/${templateName}`);
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response || err);
    } finally {
    }
  }
}

export default WebTemplateStore;
