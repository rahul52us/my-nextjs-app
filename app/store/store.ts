import AuthStore from "./authStore/authStore";
import LayoutStore from "./layoutStore/LayoutStore";
import DashStore from "./authStore/dashStore";
import TestimonialStore from "./testimonialStore/testimonialStore";
import { configure } from "mobx";
import QuizStore from "./quizStore/quizStore";
import OrganisationStore from "./organisationStore/organisationStore";
import TaskStore from "./taskStore/taskStore";
import VideoStore from "./videosStore/videosStore";
import ProjectStore from "./projectStore/projectStore";
import ChatMessageStore from "./ChatMessageStore/ChatMessageStore";
import ThemeStore from "./themeStore/themeStore";
import NotesStore from "./notesStore/NotesStore";
import ClassStore from "./classStore/ClassStore";
import ExamStore from "./examStore/examStore";
import BlogStore from "./blogStore/blogStore";
import StudentStore from "./userTypes/StudentStore";
import TripStore from "./tripStore/tripStore";
import DepartmentStore from "./departmentStore/departmentStore";
import CompanyStore from "./companyStore/companyStore";
import RequestStore from "./requestStore/requestStore";
import AttendencePunchStore from "./attendenceStore/attendencePunchStore";
import Userstore from "./userStore/userStore";
import BookLiberary from "./BookLiberary/bookLiberary";
import OrderStore from "./orderStore/orderStore";
import WebTemplateStore from "./webTemplateStore/webTemplateStore";

configure({ enforceActions: "never" });

const store = {
  auth: new AuthStore(),
  themeStore: new ThemeStore(),
  quiz: new QuizStore(),
  layout: new LayoutStore(),
  DashStore: new DashStore(),
  TestimonialStore: new TestimonialStore(),
  Organisation: new OrganisationStore(),
  Task: new TaskStore(),
  Project: new ProjectStore(),
  VideoStore: new VideoStore(),
  chatMessage: new ChatMessageStore(),
  notesStore: new NotesStore(),
  classStore: new ClassStore(),
  ExamStore: new ExamStore(),
  BlogStore: new BlogStore(),
  tripStore: new TripStore(),
  OrderStore: new OrderStore(),
  bookLiberary: new BookLiberary(),
  // users
  company: new CompanyStore(),
  Student: new StudentStore(),
  User: new Userstore(),
  DepartmentStore: new DepartmentStore(),
  requestStore: new RequestStore(),
  AttendencePunch: new AttendencePunchStore(),

  //
  WebTemplateStore: new WebTemplateStore()
};

export default store;
