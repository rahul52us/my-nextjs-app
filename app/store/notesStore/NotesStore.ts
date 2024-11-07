import axios from "axios";
import { makeObservable, observable, action, computed } from "mobx";
import { advancedSearch } from "../../config/constant/function";

class NotesStore {
  categories: any = {
    data: [],
    currentPage: 1,
    loading: true,
    hasFetch: false,
    totalPages: 0,
  };

  categoryCoursesCount : any = {
    data : [],
    loading : true
  }

  courses : any = {
    data: [],
    currentPage: 1,
    hasMore: false,
    loading: true,
    hasFetch: false,
    totalPages: 0,
  };

  originalData: any[] = [];

  constructor() {
    makeObservable(this, {
      categories: observable,
      originalData: observable,
      categoryCoursesCount:observable,
      courses:observable,
      getCategories: action,
      getCategoryCoursesCount:action,
      createCategory: action,
      localFiltering: action,
      getSingleCategory: action,
      getcourses:action,
      filteredData: computed,
    });
  }

  getCategories = action(async (sendData: any) => {
    this.categories.loading = true;
    try {
      const { data } = await axios.post(
        `notes/categories?page=${sendData.page}&limit=15`
      );
      this.categories.hasFetch = true;
      this.categories.data = data.data.categories;
      this.categories.totalPages = data?.data?.totalPages;

      // Store the original data on fetch
      this.originalData = data.data.categories;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    } finally {
      this.categories.loading = false;
    }
  });

  getcourses = async (sendData : any) => {
    try {
      this.courses.loading = true;
      this.courses.hasFetch = true;
      const { data } = await axios.get(`/notes?category=${sendData.category}&page=${sendData.page}`);
      this.courses.data = data?.data?.courses || [];
      this.courses.totalPages = data.data?.totalPages || 1;
      return data;
    } catch (err: any) {
      this.courses.hasFetch = false;
      return Promise.reject(err?.response?.data);
    } finally {
      this.courses.loading = false;
    }
  }

  createCategory = async (sendData: any) => {
    try {
      const { data } = await axios.post("/notes/category", sendData);
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  getCategoryCoursesCount = async () => {
    try {
      this.categoryCoursesCount.loading = true;
      const { data } = await axios.get(`/notes/categoryCoursescounts`);
      this.categoryCoursesCount.data = data?.data
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data);
    } finally {
      this.categoryCoursesCount.loading = false;
    }
  }

  getSingleCategory = async (Id: any) => {
    return this.categories.data.filter((item: any) => item._id === Id);
  };

  localFiltering = (searchValue: any) => {
    const filteredData = advancedSearch(this.originalData, searchValue);
    this.categories.data = filteredData;
  };

  get filteredData() {
    return this.categories.data;
  }
}

export default NotesStore;
