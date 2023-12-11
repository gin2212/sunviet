import React from "react";
import { HomeOutlined } from "@ant-design/icons";
import { Layout } from "antd";
import { useNavigate } from "react-router-dom";
import { Menu, MenuItem } from "react-pro-sidebar";
import logo from "../assets/images/logo.jpg";

const { Sider } = Layout;
const Sidebar = ({ collapsed }) => {
  const navigate = useNavigate();

  const handlePage = (href) => {
    navigate(href);
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={200}
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
        <MenuItem
          className="custom-menu font-medium text-[15px]"
          active={window.location.pathname === "/department"}
          icon={<HomeOutlined />}
          onClick={() => handlePage("/department")}
        >
          Phòng ban
        </MenuItem>
        <MenuItem
          className="custom-menu font-medium text-[15px]"
          active={window.location.pathname === "/project"}
          icon={<HomeOutlined />}
          onClick={() => handlePage("/project")}
        >
          Dự án
        </MenuItem>
        <MenuItem
          className="custom-menu font-medium text-[15px]"
          active={window.location.pathname === "/approval-process"}
          icon={<HomeOutlined />}
          onClick={() => handlePage("/approval-process")}
        >
          Quy trình
        </MenuItem>
      </Menu>
    </Sider>
  );
};

export default Sidebar;
