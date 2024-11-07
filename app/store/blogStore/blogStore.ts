import axios from "axios";
import { action, makeObservable, observable } from "mobx";
import store from "../store";

class BlogStore {
  auth : any;
  blogs = {
    data: [],
    loading: false,
    hasFetch: false,
    currentPage: 1,
    TotalPages: 0,
  };

  blogComments = {
    activeBlogId:null,
    data: [] as any,
    loading: false,
    hasFetch: false,
    currentPage: 0,
    TotalPages: 0,
    totalComments:0
  };

  constructor() {
    makeObservable(this, {
      blogs: observable,
      blogComments: observable,
      getBlogs: action,
      createBlog: action,
      getSingleBlogs: action,
      getComments: action,
      createComment: action,
    });
  }


  createBlog = async (sendData: any) => {
    try {
      const { data } = await axios.post("/blog", {...sendData,company : store.auth.getCurrentCompany()});
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  getSingleBlogs = async (sendData: any) => {
    try {
      this.blogComments.data = []
      this.blogComments.totalComments = 0;
      this.blogComments.TotalPages = 0;
      this.blogComments.currentPage = 1
      this.blogs.loading = true;
      let url = sendData.title ? `title=${sendData.title}` :`blogId=${sendData.blogId}`
      const { data } = await axios.get(`/blog/?${url}`);
      return data.data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    } finally {
      this.blogs.loading = false;
    }
  };

  getBlogs = async (sendData : any) => {
    try {
      this.blogs.loading = true;
      const { data } = await axios.post(`/blog/get`,{company : [store.auth.company]},{params : {...sendData}});
      this.blogs.data = data?.data?.data || [];
      this.blogs.TotalPages = data?.data?.totalPages || 0;
      return data.data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    } finally {
      this.blogs.loading = false;
    }
  };

  getComments = async (blogId: any, currentPage : number) => {
    try {
      this.blogComments.loading = true;
      const { data } = await axios.get(`/blog/comments/${blogId}?page=${currentPage}`);
      const newComments = data?.data?.comments || [];
      this.blogComments.data = [...this.blogComments.data, ...newComments];
      this.blogComments.totalComments = data?.data?.totalComments || 0;
      this.blogComments.TotalPages = data?.data?.totalPages || 0;
      this.blogComments.currentPage = currentPage
      this.blogComments.activeBlogId = blogId
      return data.data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    } finally {
      this.blogComments.loading = false;
    }
  };

  createComment = async (sendData: any) => {
    try {
      const { data } = await axios.post(`/blog/comment/${sendData?.blogId}`, {
        blog:sendData.blogId,
        content: sendData.content,
        createdAt: new Date(),
        parentComment: sendData?.parentComment,
        company:store.auth.getCurrentCompany()
      });
      let createdResponse : any = {
        ...data.data,
        user:{...sendData.user}
      }
      this.blogComments.data.unshift(createdResponse);
      this.blogComments.totalComments += 1
      return data.data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };
}

export default BlogStore;
