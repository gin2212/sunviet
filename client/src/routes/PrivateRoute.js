import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ element }) => {
  const isLogin = localStorage.getItem("accessToken");

  if (!isLogin || Date.now() > parseInt(isLogin, 10)) {
    return <Navigate to="/login" />;
  }

  return element;
};

export default PrivateRoute;
