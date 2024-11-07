import axios from "axios";
import { action, makeObservable, observable } from "mobx";
import { QuizCategoryValue } from "../../pages/Dashboard/quiz/component/Forms/utils/dto";

class QuizStore {
  questions : any = {
    data : [],
    loading : false,
    hasFetch: false
  }

  dashQuiz: any = {
    data: [],
    loading: false,
    hasFetch: false,
  };

  categories: any = [];
  openDeleteCategoryModal: any = {
    data: null,
    open: false,
  };

  categoryQuizCount : any = {
    data : [],
    loading : true
  }


  constructor() {
    makeObservable(this, {
      categories: observable,
      openDeleteCategoryModal: observable,
      dashQuiz: observable,
      questions:observable,
      categoryQuizCount:observable,
      CreateQuiz:action,
      getCategories: action,
      getDashQuiz: action,
      createCategory: action,
      deleteCategory: action,
      setDeleteCategoryModal: action,
      getQuestionsByCategory:action,
      getCategoryQuizCount:action
    });
  }

  setDeleteCategoryModal = (data: any = undefined) => {
    if (this.openDeleteCategoryModal.open === true) {
      this.openDeleteCategoryModal = {
        data: null,
        open: false,
      };
    } else {
      const dt = this.categories.filter(
        (item: any) => item._id.toString() === data?.action
      );
      this.openDeleteCategoryModal = {
        data: dt.length ? dt[0] : null,
        open: true,
      };
    }
  };

  CreateQuiz = async (sendData : any) => {
    try {
      const { data } = await axios.post("quiz/create", sendData);
      console.log(data)
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err?.message);
    }
  }

  getDashQuiz = async () => {
    try {
      this.dashQuiz.loading = true;
      const { data } = await axios.get("/quiz");
      this.dashQuiz.data = data.data;
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err?.message);
    } finally {
      this.dashQuiz.loading = false;
    }
  };

  getCategories = async () => {
    try {
      this.dashQuiz.loading = true;
      const { data } = await axios.post("/quiz");
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err?.message);
    } finally {
      this.dashQuiz.loading = false;
    }
  };

  createCategory = async (categoryData: QuizCategoryValue) => {
    try {
      const { data } = await axios.post("quiz/category/create", categoryData);
      this.categories.push(data.data);
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err?.message);
    }
  };

  deleteCategory = async (id: string) => {
    try {
      const { data } = await axios.delete(`quiz/category/${id}`);
      this.categories = this.categories.filter(
        (item: any) => item._id.toString() !== id
      );
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err?.message);
    }
  };

  getQuestionsByCategory = async (id : string) => {
    try
    {
      this.questions.loading = true
      const { data } = await axios.get(`quiz/questions/${id}`);
      this.questions.data = data.data
      return data
    }
    catch(err)
    {

    }
    finally {
      this.questions.loading = false
    }
  }

  getCategoryQuizCount = async () => {
    try {
      this.categoryQuizCount.loading = true;
      const { data } = await axios.get(`/quiz/categoryQuizcounts`);
      this.categoryQuizCount.data = data?.data
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data);
    } finally {
      this.categoryQuizCount.loading = false;
    }
  }
}

export default QuizStore;
