import "../auth/style.css";
import loginBG from "../../assets/images/loginBG.svg";
import logo from "../../assets/images/logo.jpg";
import { useNavigate } from "react-router-dom";
import { Button, Form, Input, message } from "antd";
import { callLogin } from "../../services/api";

export default function Login() {
  const navigate = useNavigate();

  const onFinish = async (values) => {
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
              Chào mừng đến với <span style={{ color: "#fd9900" }}>OKVIP</span>!
              👋
            </h2>
            <Form
              name="basic"
              labelCol={{
                span: 24,
              }}
              wrapperCol={{
                span: 22,
              }}
              initialValues={{
                remember: true,
              }}
              onFinish={onFinish}
              autoComplete="off"
            >
              <Form.Item
                label="Email"
                name="email"
                style={{
                  fontWeight: "bold",
                }}
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập email!",
                  },
                ]}
              >
                <Input
                  size="large"
                  placeholder="Nhập email"
                  className="custom-button"
                />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                style={{
                  fontWeight: "bold",
                }}
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập mật khẩu!",
                  },
                ]}
              >
                <Input.Password
                  size="large"
                  placeholder="Nhập mật khẩu"
                  className="custom-button"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  style={{
                    backgroundColor: "#ffa827",
                    width: "100%",
                    height: "40px",
                    color: "#fff",
                    marginTop: "30px",
                  }}
                  className="custom-button"
                  size="large"
                  htmlType="submit"
                >
                  Đăng nhập
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
}
