import React, { useEffect, useState } from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LockOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import { Layout, Button, theme, Avatar, Dropdown, message, Form } from "antd";
import { useNavigate } from "react-router-dom";
import { updateUser, getMe } from "../services/api";
import ModalChangePass from "./Modal/ModalChangePass";

const { Header } = Layout;

const HeaderMain = ({ collapsed, setCollapsed }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState();
  const [isModalChangePass, setIsModalChangePass] = useState(false);
  const [image, setImage] = useState();
  const [imageUrl, setImageUrl] = useState();
  const [imageEditUrl, setImageEditUrl] = useState();

  useEffect(() => {
    handleInfoUser();
  }, []);
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const ShowChangePass = () => {
    setIsModalChangePass(true);
  };

  const handleInfoUser = async () => {
    const res = await getMe();
    setUserInfo(res);
  };

  const onFinish = async (data) => {
    const formData = new FormData();

    if (image) {
      formData.append("image", image);
    }
    if (data.password) {
      formData.append("password", data.password);
    }
    formData.append("fullName", data.fullName);
    formData.append("phoneNumber", data.phoneNumber);

    try {
      await updateUser(data.id, formData);
      message.success("Cập nhật thôn tin thành công!");
      setIsModalChangePass(false);
      form.resetFields();
      handleInfoUser();
    } catch (error) {
      console.log(error);
      message.error("Cập nhật thông tin thất bại!");
    }
  };

  const itemsSecondDropdown = [
    {
      label: <div onClick={ShowChangePass}>Cập nhật thôn tin</div>,
      key: "1",
      icon: <UserOutlined />,
    },
    {
      label: <div onClick={handleLogout}>Đăng xuất</div>,
      key: "2",
      icon: <RollbackOutlined />,
    },
  ];

  return (
    <>
      <Header
        style={{
          padding: 0,
          background: colorBgContainer,
        }}
      >
        <div className="header">
          <div className="button-colspan">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: "16px",
                width: 64,
                height: 64,
              }}
            />
          </div>
          <div className="user-info">
            <div>
              <Dropdown
                menu={{
                  items: itemsSecondDropdown,
                }}
                trigger={["click"]}
              >
                <div onClick={(e) => e.preventDefault()}>
                  <div className="role">
                    <div style={{ height: "100%" }}>
                      <div className=" role-admin">
                        {userInfo?.role?.roleName}
                      </div>
                      <div className=" role-name">{userInfo?.fullName}</div>
                    </div>

                    {userInfo?.avatar ? (
                      <Avatar
                        size="large"
                        src={`${process.env.REACT_APP_API_URL}images/${userInfo?.avatar}`}
                      />
                    ) : (
                      <Avatar size="large" icon={<UserOutlined />} />
                    )}
                  </div>
                </div>
              </Dropdown>
            </div>
          </div>
        </div>
      </Header>

      <ModalChangePass
        isModalChangePass={isModalChangePass}
        setIsModalChangePass={setIsModalChangePass}
        onFinish={onFinish}
        form={form}
        dataUser={userInfo}
        setImage={setImage}
        image={image}
        imageUrl={imageUrl}
        setImageUrl={setImageUrl}
        imageEditUrl={imageEditUrl}
        setImageEditUrl={setImageEditUrl}
      />
    </>
  );
};

export default HeaderMain;
