import { Result } from "antd";
import React from "react";

const Error403 = () => {
  return (
    <Result
      status="403"
      title="Truy Cập Bị Từ Chối"
      subTitle="Bạn không có quyền truy cập trang này."
    />
  );
};

export default Error403;
