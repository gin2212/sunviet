
import React, { useEffect, useState } from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LockOutlined,
  RollbackOutlined,
  BellOutlined,
} from "@ant-design/icons";
import {
  Layout,
  Button,
  theme,
  Avatar,
  Dropdown,
  message,
  Form,
  Menu,
} from "antd";
import { useNavigate } from "react-router-dom";
import { getAccountInfo, createNewPassword, getNotify } from "../services/api";
import ModalViewInfo from "./Modal/ModalViewInfo";
import ModalChangePass from "./Modal/ModalChangePass";

const { Header } = Layout;

const HeaderMain = ({ collapsed, setCollapsed }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState();
  const [isModalUser, setIsModalUser] = useState(false);
  const [isModalChangePass, setIsModalChangePass] = useState(false);
  const [noti, setListNoti] = useState();

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  useEffect(() => {
    handleInfoUser();
    fetchDataNoti();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleInfoUser = async () => {
    const res = await getAccountInfo();
    setUserInfo(res?.data);
    localStorage.setItem("role", res?.data?.roleId.name);
  };

  const handleShowModel = () => {
    setIsModalUser(true);
  };

  const ShowChangePass = () => {
    setIsModalChangePass(true);
  };

  //Lấy danh sách thông báo để xử lý 29/11
  const fetchDataNoti = async () => {
    const res = await getNotify({ limit: 5 });
    setListNoti(res?.data?.items);
  };

  const onFinish = async (data) => {
    const res = await createNewPassword(data);
    if (res.statusCode === 200) {
      message.success("Đổi mật khẩu thành công!");
      setIsModalChangePass(false);
      form.resetFields();
    } else if (res.statusCode === 422) {
      message.error("Đổi mật khẩu thất bại!");
    }
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
        <div className="flex justify-between items-center">
          <div className="flex items-center">
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
          <div className="flex gap-2 mr-10">
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
                      <div className="h-1/2 role-admin">
                        {userInfo?.roleId?.name}
                      </div>
                      <div className="h-1/2 role-name">{userInfo?.name}</div>
                    </div>
                    <Avatar size="large" icon={<UserOutlined />} />
                  </div>
                </div>
              </Dropdown>
            </div>
          </div>
        </div>
      </Header>
      <ModalViewInfo
        isModalUser={isModalUser}
        setIsModalUser={setIsModalUser}
        userInfo={userInfo}
      />
      <ModalChangePass
        isModalChangePass={isModalChangePass}
        setIsModalChangePass={setIsModalChangePass}
        onFinish={onFinish}
        form={form}
      />
    </>
  );
};

export default HeaderMain;
