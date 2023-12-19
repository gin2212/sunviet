import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ element }) => {
  const isLogin = localStorage.getItem("accessToken");

  if (!isLogin) {
    return <Navigate to="/login" />;
  }

  return element;
};

export default PrivateRoute;
