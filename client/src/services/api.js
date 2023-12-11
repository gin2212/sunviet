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

//ApprovalProcess
export const getPagingApprovalProcess = (data) => {
  return axios.get("api/approval-process/getPaging", data);
};

export const getAllApprovalProcess = () => {
  return axios.get("api/approval-process/getAll");
};

export const getApprovalProcessId = (id) => {
  return axios.get(`api/approval-process/getById/${id}`);
};

export const createApprovalProcess = (data) => {
  return axios.post("api/approval-process/create", data);
};

export const updateApprovalProcess = (id, data) => {
  return axios.put(`api/approval-process/update/${id}`, data);
};

export const deleteApprovalProcess = (id) => {
  return axios.delete(`api/approval-process/delete/${id}`);
};

//User
export const getAllUser = () => {
  return axios.get("api/user/getAll");
};
