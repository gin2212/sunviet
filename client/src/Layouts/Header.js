import React, { useEffect, useState } from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
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
import { updateUser, getMe, getNotify, markAsRead } from "../services/api";
import ModalChangePass from "./Modal/ModalChangePass";
import moment from "moment";

const { Header } = Layout;

const HeaderMain = ({ collapsed, setCollapsed }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState();
  const [isModalChangePass, setIsModalChangePass] = useState(false);
  const [image, setImage] = useState();
  const [imageUrl, setImageUrl] = useState();
  const [imageEditUrl, setImageEditUrl] = useState();
  const [listNoti, setListNoti] = useState();
  const [total, setTotal] = useState(0);

  useEffect(() => {
    handleInfoUser();
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await getNotify();

    setTotal(res?.totalPages);
    setListNoti(res?.data);
  };

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

    if (data?.password) {
      formData.append("password", data.password);
    }

    if (data?.signatureImage) {
      formData.append("signatureImage", data.signatureImage);
    }

    if (data?.stampImage) {
      formData.append("stampImage", data.stampImage);
    }

    formData.append("fullName", data?.fullName);
    formData.append("phoneNumber", data?.phoneNumber);

    try {
      await updateUser(data?.id, formData);
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

  const menu = (
    <Menu>
      {listNoti?.length > 0 ? (
        listNoti?.map((item, index) => (
          <Menu.Item key={index} onClick={() => handleRead(item)}>
            <p> {item?.message}</p>
            <p> {moment(item?.createdAt).format("HH:mm DD/MM/YYYY")}</p>
          </Menu.Item>
        ))
      ) : (
        <Menu.Item key={1}>
          <p> Không có thông báo mới</p>
        </Menu.Item>
      )}
    </Menu>
  );
  const handleRead = async (item) => {
    try {
      const data = await markAsRead(item._id);
      if (data.status === 1) {
        fetchData();
        navigate(`/proposal/${item.proposal}`);
      }
    } catch (error) {
      console.log(error);
    }
  };

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
            <div className="icon-ring">
              {total > 0 && (
                <span className="number-noti">
                  {total > 10 ? "10+" : total}
                </span>
              )}

              <Dropdown overlay={menu} trigger={["click"]} placement="bottom">
                <div onClick={(e) => e.preventDefault()}>
                  <BellOutlined
                    style={{
                      fontSize: "20px",
                      backgroundColor: "#F0F2F5",
                      padding: "10px",
                      boxSizing: "border-box",
                      borderRadius: "50%",
                      cursor: "pointer",
                    }}
                  />
                </div>
              </Dropdown>
            </div>
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
