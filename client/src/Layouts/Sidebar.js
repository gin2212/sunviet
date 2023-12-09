import React, { useEffect, useState } from "react";
import {
  UserOutlined,
  HomeOutlined,
  FolderOpenOutlined,
  GlobalOutlined,
  HistoryOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { Layout } from "antd";
import { useNavigate } from "react-router-dom";
import { Menu, MenuItem } from "react-pro-sidebar";
import logo from "../assets/images/logo.jpg";
import { useLocation } from "react-router-dom";
import { getAccountInfo } from "../services/api";

const { Sider } = Layout;
const Sidebar = ({ collapsed }) => {
  const [userId, setUserId] = useState();
  const location = useLocation();
  const isDetailPage = /\/detail\//.test(location.pathname);

  useEffect(() => {
    getRoleId();
  }, []);

  const getRoleId = async () => {
    let res = await getAccountInfo();
    setUserId(res?.data?.roleId?.name);
  };

  const navigate = useNavigate();

  const handlePage = (href) => {
    navigate(href);
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={230}
      style={{
        position: "fixed",
        left: 0,
        height: "100vh",
      }}
    >
      <div className="logo-vertical">
        <a href={"/"}>
          <img src={logo} alt="" />
        </a>
      </div>
      <Menu>
        <MenuItem
          className="custom-menu font-medium text-[15px]"
          active={window.location.pathname === "/"}
          icon={<HomeOutlined />}
          onClick={() => handlePage("/")}
        >
          Trang chủ
        </MenuItem>

        {userId === "user" ? null : (
          <MenuItem
            className="custom-menu font-medium text-[15px]"
            active={window.location.pathname === "/users"}
            icon={<UserOutlined />}
            onClick={() => handlePage("/users")}
          >
            Quản lý User
          </MenuItem>
        )}
        <MenuItem
          className="custom-menu font-medium text-[15px]"
          active={window.location.pathname === "/domain"}
          icon={<GlobalOutlined />}
          onClick={() => handlePage("/domain")}
        >
          Danh sách Domain
        </MenuItem>

        <MenuItem
          className={`custom-menu font-medium text-[15px] ${isDetailPage && "ps-active"
            }`}
          active={window.location.pathname === "/suggest"}
          icon={<FolderOpenOutlined />}
          onClick={() => handlePage("/suggest")}
        >
          Danh sách Đề Xuất
        </MenuItem>
        <MenuItem
          className="custom-menu font-medium text-[15px]"
          active={window.location.pathname === "/histories"}
          icon={<HistoryOutlined />}
          onClick={() => handlePage("/histories")}
        >
          Lịch sử thao tác
        </MenuItem>
        <MenuItem
          className="custom-menu font-medium text-[15px]"
          active={window.location.pathname === "/notifies"}
          icon={<LinkOutlined />}
          onClick={() => handlePage("/notifies")}
        >
          Thông báo
        </MenuItem>
      </Menu>
    </Sider>
  );
};

export default Sidebar;
