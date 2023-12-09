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
        return refreshTokenAndRetryRequest(error.config);
      }
    } else {
      return Promise.reject(error);
    }
  }
);

const refreshTokenAndRetryRequest = async () => {
  try {
    let data = localStorage.getItem("data");

    data = JSON.parse(data);
    if (data) {
      const param = {
        refreshToken: data.token.refreshToken,
        userId: data.user._id,
      };

      const response = await apiClient.post(urlRefreshToken, param);
      if (response.data) {
        const newAccessToken = response.data.data.accessToken;
        localStorage.setItem("accessToken", newAccessToken);
      }
    }
  } catch (refreshError) {
    console.error("Token refresh failed:", refreshError);
    message.error("Phiên làm việc đã hết, vui lòng đăng nhập lại");
    localStorage.clear();
    history.push("/login");
  }
};
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
    return axios.post(url, data);
  };
  /**
   * Put data
   */
  put = (url, data) => {
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
