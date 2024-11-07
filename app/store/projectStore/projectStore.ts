import axios from "axios";
import { action, makeObservable, observable } from "mobx";
import store from "../store";
import { paginationLimit } from "../../config/constant/variable";

class ProjectStore {
  projects: any = {
    data: [],
    loading: false,
    currentPage :1,
    limit : paginationLimit
  };

  tasks: any = {
    data: [],
    loading: false,
    currentPage :1,
    limit : paginationLimit
  };

  task = {
    data : [],
    loading : false,
    currentPage:1,
    limit : paginationLimit,
    totalPages:1
  }

  projectCount : any = {
    data : 0,
    loading : false
  }

  openProjectDrawer : any = {
    type: "create",
    open: false,
    data: null,
  };

  openTaskDrawer : any = {
    type: "create",
    open: false,
    data: null,
    project : null
  };

  constructor() {
    makeObservable(this, {
      openProjectDrawer: observable,
      projects: observable,
      projectCount:observable,
      setOpenProjectDrawer: action,
      createProject: action,
      getProjects: action,
      getSingleProject: action,
      updateProject:action,
      getProjectCounts:action,
      addProjectMembers:action,
      getIndividualProject:action,
      // task
      task:observable,
      openTaskDrawer:observable,
      createTask:action,
      setOpenTaskDrawer:action,
      updateTask:action,
      getSingleTask:action
    });
  }

  updateProject = async (sendData: any) => {
    try {
      const { data } = await axios.put(`/project/${sendData._id}`, {
        ...sendData,
        company: store.auth.getCurrentCompany(),
      });
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response || err);
    }
  };

  addProjectMembers = async (sendData: any) => {
    try {
      const { data } = await axios.put(`/project/add/member/${sendData._id}`, {
        ...sendData,
        company: store.auth.getCurrentCompany(),
      });
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response || err);
    }
  };


  createProject = async (sendData: any) => {
    try {
      const { data } = await axios.post("/project", {
        ...sendData,
        company: store.auth.getCurrentCompany(),
      });
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response || err);
    }
  };

  getSingleProject = async (sendData: any) => {
    try {
      const { data } = await axios.get(`/project/single/${sendData.id}`, {
        params: { company: store.auth.getCurrentCompany() },
      });
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response || err);
    }
  };

  getProjectCounts = async (sendData : any = {}) => {
    try {
      this.projectCount.loading = true;
      const { data } = await axios.post(`/project/total/count`,{company : [store.auth.getCurrentCompany()],...sendData});
      this.projectCount.data = data?.data || 0
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response || err);
    } finally {
      this.projectCount.loading = false;
    }
  }

  getIndividualProject = async (sendData : any = {}) => {
    try {
      const { data } = await axios.post(`/project/individual/${sendData.projectId}`,{company : [store.auth.getCurrentCompany()],...sendData});
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response || err);
    } finally {
    }
  }

  getProjects = async (sendData: any = {}) => {
    this.projects.loading = true;
    try {
      const { data } = await axios.post(
        `/project/get`,
        {company : [store.auth.getCurrentCompany()],...sendData},
        {params : {page : sendData.page, limit : sendData.limit }}
      );
      this.projects.data = data.data?.data || [];
      this.projects.totalPages = data.data?.totalPages || 1;
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response || err);
    } finally {
      this.projects.loading = false;
    }
  };

  setOpenProjectDrawer = (type: string, data?: any) => {
    this.openProjectDrawer.open = this.openProjectDrawer.open ? false : true;
    this.openProjectDrawer.type = type;
    this.openProjectDrawer.data = this.openProjectDrawer.open
      ? data || null
      : null;
    this.openProjectDrawer.type = this.openProjectDrawer.open ? type : "create";
  };

  setOpenTaskDrawer = (type : string, data? : any) => {
    this.openTaskDrawer.open = this.openTaskDrawer.open ? false : true;
    this.openTaskDrawer.type = type;
    this.openTaskDrawer.data = this.openTaskDrawer.open
      ? data || null
      : null;
    this.openTaskDrawer.type = this.openTaskDrawer.open ? type : "create";
  }

  // Task Related function

  getSingleTask = async (sendData: any) => {
    try {
      const { data } = await axios.get(`/project/task/single/${sendData.id}`, {
        params: { company: store.auth.getCurrentCompany() },
      });
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response || err);
    }
  };


  createTask = async (sendData: any) => {
    try {
      const { data } = await axios.post(`/project/task/${sendData.projectId}/create`, {
        ...sendData,
        company: store.auth.getCurrentCompany(),
      });
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response || err);
    }
  };

  updateTask = async (sendData: any) => {
    try {
      const { data } = await axios.put(`/project/task/${sendData._id}`, {
        ...sendData,
        company: store.auth.getCurrentCompany(),
      });
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response || err);
    }
  };

  getTasks = async (sendData: any) => {
    this.task.loading = true;
    try {
      const { data } = await axios.post(
        `/project/task/${sendData.id}/get`,
        {...sendData, company : [store.auth.getCurrentCompany() ]},
        {params : {page : this.task.currentPage, limit : this.task.limit }}
      );
      this.task.data = data.data?.data || [];
      this.task.totalPages = data.data?.totalPages || 1;
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response || err);
    } finally {
      this.projects.loading = false;
    }
  };

}

export default ProjectStore;
