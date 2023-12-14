/* eslint-disable no-debugger */
import axios from "axios";
import { message } from "antd";
import history from "./history";

axios.defaults.baseURL = process.env.REACT_APP_API_URL;
axios.defaults.headers.post["Content-Type"] = "application/json";

const urlRefreshToken = "/api/auth/refresh";
const token = localStorage.getItem("accessToken")
  ? localStorage.getItem("accessToken")
  : null;
if (token) axios.defaults.headers.common["Authorization"] = "Bearer " + token;
const apiClient = axios.create();

axios.interceptors.response.use(
  (response) => {
    return response.data ? response.data : response;
  },
  (error) => {
    console.log(error.response);
    console.warn("Error status", error.response);
    if (error.response) {
      if (error.response.status === 500) {
        history.push("/error-server");
      } else if (error.response.status === 403) {
        history.push("/error-403");
      } else {
        message.error("Đã có lỗi xảy ra vui lòng thử lại sau !");
      }
    } else {
      return Promise.reject(error);
    }
  }
);
/**
 * Sets the default authorization
 * @param {*} token
 */
const setAuthorization = (token) => {
  axios.defaults.headers.common["Authorization"] = "Bearer " + token;
};

class APIClient {
  get = async (url, params) => {
    let response;

    let paramKeys = [];
    const token = localStorage.getItem("accessToken")
      ? localStorage.getItem("accessToken")
      : null;
    if (token)
      axios.defaults.headers.common["Authorization"] = "Bearer " + token;

    if (params) {
      Object.keys(params).map((key) => {
        paramKeys.push(key + "=" + params[key]);
        return paramKeys;
      });
      const queryString =
        paramKeys && paramKeys.length ? paramKeys.join("&") : "";
      await axios
        .get(`${url}?${queryString}`, params)
        .then(function (res) {
          response = res;
        })
        .catch(function (error) {
          console.error(error);
        });
    } else {
      await axios
        .get(`${url}`)
        .then(function (res) {
          response = res;
        })
        .catch(function (error) {
          console.log(error);
        });
    }
    return response;
  };
  /**
   * post given data to url
   */
  post = (url, data) => {
    if (data instanceof FormData) {
      return axios.post(url, data, {
        headers: { "content-type": "application/x-www-form-urlencoded" },
      });
    }
    return axios.post(url, data);
  };
  /**
   * Put data
   */
  put = (url, data) => {
    if (data instanceof FormData) {
      return axios.put(url, data, {
        headers: { "content-type": "application/x-www-form-urlencoded" },
      });
    }
    return axios.put(url, data);
  };
  /**
   * Delete
   */
  delete = (url, config) => {
    return axios.delete(url, { ...config });
  };

  createWithFormData = (url, data) => {
    let formData = new FormData();
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key]);
    });
    return axios.post(url, formData, {
      headers: { "content-type": "application/x-www-form-urlencoded" },
    });
  };

  updateWithFormData = (url, data) => {
    let formData = new FormData();
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key]);
    });
    return axios.put(url, formData, {
      headers: { "content-type": "application/x-www-form-urlencoded" },
    });
  };
}

const getLoggedinUser = () => {
  const user = localStorage.getItem("accessToken");
  if (!user) {
    return null;
  } else {
    return JSON.parse(user);
  }
};

export { APIClient, setAuthorization, getLoggedinUser };
