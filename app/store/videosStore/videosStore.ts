import axios from "axios";
import { action, makeObservable, observable } from "mobx";

class VideoStore {
  categories: any = {
    data: [],
    currentPage: 1,
    hasMore: false,
    loading: true,
    hasFetch: false,
    totalPages: 0,
  };

  categoryVideosCount : any = {
    data : [],
    loading : true
  }

  videos: any = {
    data: [],
    currentPage: 1,
    hasMore: false,
    loading: true,
    hasFetch: false,
    totalPages: 0,
  };

  videosCategory: any = {
    data: [],
    currentPage: 1,
    hasMore: false,
    loading: true,
    hasFetch: false,
    totalPages: 0,
  };

  openVideoDrawer = {
    type: "",
    open: false,
  };

  constructor() {
    makeObservable(this, {
      openVideoDrawer: observable,
      categories: observable,
      videos: observable,
      videosCategory: observable,
      categoryVideosCount:observable,
      setOpenVideoDrawer: action,
      createVideo: action,
      getCategories: action,
      getVideos:action,
      createVideoCategory: action,
      getCategoryVideoCount:action
    });
  }

  getVideos = async (sendData : any) => {
    try {
      this.videos.loading = true;
      this.videos.hasFetch = true;
      const { data } = await axios.get(`/videos?category=${sendData.category}&page=${sendData.page}`);
      this.videos.data = data?.data?.videos || [];
      this.videos.totalPages = data.data?.totalPages || 1;
      return data;
    } catch (err: any) {
      this.videos.hasFetch = false;
      return Promise.reject(err?.response?.data);
    } finally {
      this.videos.loading = false;
    }
  }

  getCategoryVideoCount = async () => {
    try {
      this.categoryVideosCount.loading = true;
      const { data } = await axios.get(`/videos/categoryVideoscounts`);
      this.categoryVideosCount.data = data?.data
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data);
    } finally {
      this.categoryVideosCount.loading = false;
    }
  }

  getCategories = async (sendData: any) => {
    try {
      this.categories.loading = true;
      this.categories.hasFetch = true;
      const { data } = await axios.get(`/videos/categories?page=${sendData.page}`);
      this.categories.data = data?.data?.categories || [];
      this.categories.totalPages = data.data?.totalPages || 1;
      return data;
    } catch (err: any) {
      this.categories.hasFetch = false;
      return Promise.reject(err?.response?.data);
    } finally {
      this.categories.loading = false;
    }
  };

  createVideo = async (sendData: any) => {
    try {
      const { data } = await axios.post(`/videos/create`, sendData);
      this.videos.data.unshift(data.data);
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data);
    }
  };

  createVideoCategory = async (sendData: any) => {
    try {
      const { data } = await axios.post(`/videos/category`, sendData);
      this.videosCategory.data.unshift(data.data);
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data);
    }
  };

  setOpenVideoDrawer = (type: string, data?: any) => {
    this.openVideoDrawer.open = this.openVideoDrawer.open ? false : true;
    this.openVideoDrawer.type = type;
    if (type === "edit") {
      console.log(data);
    } else {
    }
  };
}

export default VideoStore;
