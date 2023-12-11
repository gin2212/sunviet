import "../auth/style.css";
import loginBG from "../../assets/images/loginBG.svg";
import logo from "../../assets/images/logo.jpg";
import { useNavigate } from "react-router-dom";
import { Button, Form, Input, message } from "antd";
import { callLogin } from "../../services/api";
import { useState } from "react";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const onFinish = async (values) => {
    setLoading(true);
    const res = await callLogin(values);
    if (res?.status === 1) {
      localStorage.setItem("accessToken", res?.data?.token);
      localStorage.setItem("data", JSON.stringify(res?.data.user));
      message.success("Đăng nhập thành công!");
      navigate("/");
    } else if (res?.status === 2) {
      message.error("Sai mật khẩu!");
    } else if (res?.status === 3) {
      message.error("Tài khoản đã bị khóa!");
    } else if (res?.status === 4) {
      message.error("Người dùng không tồn tại!");
    }

    setLoading(false);
  };

  return (
    <>
      <div className="main">
        <div className="banner">
          <img src={loginBG} alt="" className="banner-login" />
          <img src={logo} alt="" className="logo" />
        </div>
        <div className="right">
          <div className="sign-in-form">
            <h2 className="title">
              Chào mừng đến với{" "}
              <span style={{ color: "#fd9900" }}>Sun Việt</span>! 👋
            </h2>
            <Form onFinish={onFinish} autoComplete="off" layout="vertical">
              <div className="mb-3">
                <Form.Item
                  name="email"
                  label="email"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập email!",
                      type: "string",
                      min: 1,
                    },
                  ]}
                  style={{ marginBottom: "22px" }}
                >
                  <Input placeholder="Vui lòng nhập email" allowClear={false} />
                </Form.Item>
              </div>

              <div className="mb-3">
                <Form.Item
                  name="password"
                  label="Mật khẩu"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập mật khẩu!",
                    },
                  ]}
                  style={{ marginBottom: "22px" }}
                >
                  <Input.Password
                    placeholder="Nhập mật khẩu"
                    allowClear={false}
                  />
                </Form.Item>
              </div>

              <div className="mt-5">
                <Button
                  disabled={loading}
                  color="secondary"
                  className="btn btn-secondary w-100"
                  htmlType="submit"
                >
                  Đăng Nhập
                </Button>
              </div>

              <div className="mt-4"></div>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
}
