import { APIClient } from "../utils/axiosCustomize";
const axios = new APIClient();

export function callLogin(data) {
  return axios.post("api/user/login", data);
}
