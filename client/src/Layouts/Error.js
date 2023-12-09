import { Result } from "antd";
import React from "react";

const Error = () => {
  return (
    <Result
      status="404"
      title="Đường Dẫn Không Hợp Lệ"
      subTitle="Không có trang này nha fen !!?."
    />
  );
};

export default Error;
