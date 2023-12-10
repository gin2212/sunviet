import React, { useState } from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LockOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import { Layout, Button, theme, Avatar, Dropdown, message, Form } from "antd";
import { useNavigate } from "react-router-dom";
import { getAccountInfo, createNewPassword } from "../services/api";
// import ModalViewInfo from "./Modal/ModalViewInfo";
// import ModalChangePass from "./Modal/ModalChangePass";

const { Header } = Layout;

const HeaderMain = ({ collapsed, setCollapsed }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [isModalUser, setIsModalUser] = useState(false);
  const [isModalChangePass, setIsModalChangePass] = useState(false);

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleShowModel = () => {
    setIsModalUser(true);
  };

  const ShowChangePass = () => {
    setIsModalChangePass(true);
  };

  const onFinish = async (data) => {
    // const res = await createNewPassword(data);
    // if (res.statusCode === 200) {
    //   message.success("Đổi mật khẩu thành công!");
    //   setIsModalChangePass(false);
    //   form.resetFields();
    // } else if (res.statusCode === 422) {
    //   message.error("Đổi mật khẩu thất bại!");
    // }
  };

  const itemsSecondDropdown = [
    {
      label: <div onClick={handleShowModel}>Thông tin cá nhân</div>,
      key: "1",
      icon: <UserOutlined />,
    },
    {
      label: <div onClick={ShowChangePass}>Đổi mật khẩu</div>,
      key: "2",
      icon: <LockOutlined />,
    },
    {
      label: <div onClick={handleLogout}>Đăng xuất</div>,
      key: "3",
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
                    <div className="text-white h-full">
                      {/* <div className="h-1/2 role-admin">
                        {userInfo?.roleId?.name}
                      </div>
                      <div className="h-1/2 role-name">{userInfo?.name}</div> */}
                    </div>
                    <Avatar size="large" icon={<UserOutlined />} />
                  </div>
                </div>
              </Dropdown>
            </div>
          </div>
        </div>
      </Header>
      {/* <ModalViewInfo
        isModalUser={isModalUser}
        setIsModalUser={setIsModalUser}
        userInfo={userInfo}
      />
      <ModalChangePass
        isModalChangePass={isModalChangePass}
        setIsModalChangePass={setIsModalChangePass}
        onFinish={onFinish}
        form={form}
      /> */}
    </>
  );
};

export default HeaderMain;
