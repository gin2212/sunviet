import { Result } from "antd";
import React from "react";

const ErrorServer = () => {
  return (
    <Result
      status="500"
      title="Lỗi Máy Chủ"
      subTitle="Máy chủ đang bảo trì, chờ tí nha fen !!."
    />
  );
};

export default ErrorServer;
