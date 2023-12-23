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

//Document
export const getPagingDocument = (data) => {
  return axios.get("api/document/getPaging", data);
};

export const getAllDocument = () => {
  return axios.get("api/document/getAll");
};

export const getDocumentId = (id) => {
  return axios.get(`api/document/getById/${id}`);
};

export const createDocument = (data) => {
  return axios.post("api/document/create", data);
};

export const updateDocument = (id, data) => {
  return axios.put(`api/document/update/${id}`, data);
};

export const deleteDocument = (id) => {
  return axios.delete(`api/document/delete/${id}`);
};

//Action
export const getAllAction = () => {
  return axios.get("api/action/getAll");
};

export const getPagingAction = (data) => {
  return axios.get("api/action/getPaging", data);
};

//RoleAction
export const getPagingRoleAction = (data) => {
  return axios.get("api/roleaction/getPaging", data);
};

export const getActionId = (id) => {
  return axios.get(`api/roleaction/getById/${id}`);
};

export const createAction = (data) => {
  return axios.post("api/roleaction/create", data);
};

export const updateAction = (id, data) => {
  return axios.put(`api/roleaction/update/${id}`, data);
};

export const deleteAction = (id) => {
  return axios.delete(`api/roleaction/delete/${id}`);
};

export const insertManyRoleAction = (data) => {
  return axios.post(`api/roleaction/insertMany`, data);
};
//role
export const getAllRole = () => {
  return axios.get("api/role/getAll");
};

export const getPagingRole = (data) => {
  return axios.get("api/role/getPaging", data);
};

export const getRoleId = (id) => {
  return axios.get(`api/role/getById/${id}`);
};

export const createRole = (data) => {
  return axios.post("api/role/create", data);
};

export const updateRole = (id, data) => {
  return axios.put(`api/role/update/${id}`, data);
};

export const deleteRole = (id) => {
  return axios.delete(`api/role/delete/${id}`);
};

//User
export const getAllUser = () => {
  return axios.get("api/user/getAll");
};

export const getPagingUser = (data) => {
  return axios.get("api/user/getPaging", data);
};

export const getUserId = (id) => {
  return axios.get(`api/user/getById/${id}`);
};

export const createUser = (data) => {
  return axios.post("api/user/create", data);
};

export const updateUser = (id, data) => {
  return axios.put(`api/user/update/${id}`, data);
};

export const deleteUser = (id) => {
  return axios.delete(`api/user/delete/${id}`);
};

export const getMyAction = () => {
  return axios.get("api/user/getMyAction");
};

export const getMe = () => {
  return axios.get("api/user/getMe");
};

//Notify
export const getNotify = (data) => {
  return axios.get("api/notify/getPaging", data);
};
export const markAsRead = (id) => {
  return axios.put(`api/notify/read/${id}`);
};

//Proposal

export const createProposal = (data) => {
  return axios.post("api/proposal/create", data);
};

export const getAllProposals = () => {
  return axios.get("api/proposal/getAll");
};

export const getPagingProposal = (data) => {
  return axios.get("api/proposal/getPaging", data);
};

export const getByIdProposal = (id) => {
  return axios.get(`api/proposal/getById/${id}`);
};

export const deleteProposal = (id) => {
  return axios.delete(`api/proposal/delete/${id}`);
};

export const comment = (id, data) => {
  return axios.post(`api/proposal/comment/${id}`, data);
};

export const reject = (id, data) => {
  return axios.post(`api/proposal/reject/${id}`, data);
};

export const approve = (id, data) => {
  return axios.post(`api/proposal/approve/${id}`, data);
};

export const changeStatus = (id) => {
  return axios.put(`api/proposal/changeStatus/${id}`);
};
