import { APIClient } from "../utils/axiosCustomize";
const axios = new APIClient();

export const callLogin = (data) => {
  return axios.post("api/user/login", data);
};

//Department
export const getPagingDepartment = (data) => {
  return axios.get("api/department/getPaging", data);
};

export const getAllDepartments = () => {
  return axios.get("api/department/getAll");
};

export const getDepartmentsById = (id) => {
  return axios.get(`api/department/getById/${id}`);
};

export const createDepartment = (data) => {
  return axios.post("api/department/create", data);
};

export const updateDepartment = (id, data) => {
  return axios.put(`api/department/update/${id}`, data);
};

export const deleteDepartment = (id) => {
  return axios.delete(`api/department/delete/${id}`);
};

//Project
export const getPagingProject = (data) => {
  return axios.get("api/project/getPaging", data);
};

export const getAllProject = () => {
  return axios.get("api/project/getAll");
};

export const getProjectById = (id) => {
  return axios.get(`api/project/getById/${id}`);
};

export const createProject = (data) => {
  return axios.post("api/project/create", data);
};

export const updateProject = (id, data) => {
  return axios.put(`api/project/update/${id}`, data);
};

export const deleteProject = (id) => {
  return axios.delete(`api/project/delete/${id}`);
};
