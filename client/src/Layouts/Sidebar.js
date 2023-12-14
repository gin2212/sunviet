import React, { useEffect, useState } from "react";
import { HomeOutlined } from "@ant-design/icons";
import { Layout } from "antd";
import { useNavigate } from "react-router-dom";
import { Menu, MenuItem } from "react-pro-sidebar";
import logo from "../assets/images/logo.jpg";
import { getMyAction } from "../services/api";
import {
  BiHomeCircle,
  BiTask,
  BiSync,
  BiFile,
  BiUser,
  BiUserPlus,
  BiCheckShield,
} from "react-icons/bi";

const { Sider } = Layout;

const listMenu = [
  {
    key: "department",
    item: <BiHomeCircle />,
    label: "Phòng ban",
  },
  {
    key: "project",
    item: <BiTask />,
    label: "Dự án",
  },
  {
    key: "approval-process",
    item: <BiSync />,
    label: "Quy trình",
  },
  {
    key: "document",
    item: <BiFile />,
    label: "Tài liệu",
  },
  {
    key: "user",
    item: <BiUser />,
    label: "Nhân viên",
  },
  {
    key: "role",
    item: <BiUserPlus />,
    label: "Chức vụ",
  },
  {
    key: "role-action",
    item: <BiCheckShield />,
    label: "Quyền hạn",
  },
];
const Sidebar = ({ collapsed }) => {
  const navigate = useNavigate();
  const [listAction, setListAction] = useState();

  const handlePage = (href) => {
    navigate(href);
  };

  useEffect(() => {
    const fetchData = async () => {
      const actions = await getMyAction();
      setListAction(actions.data);
    };
    fetchData();
  }, []);

  const generateMenu = (listMenu, handlePage, currentPath) => {
    return listMenu.map((menuItem) => {
      const { key, item, label } = menuItem;

      if (!listAction?.includes(key) && key !== "home") {
        return null;
      }

      return (
        <MenuItem
          key={key}
          className="custom-menu font-medium text-[15px]"
          active={currentPath === `/${key}`}
          icon={item}
          onClick={() => handlePage(`/${key}`)}
        >
          {label}
        </MenuItem>
      );
    });
  };

  const menuItems = generateMenu(
    listMenu,
    handlePage,
    window.location.pathname
  );
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
      {/* <Menu>
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
        <MenuItem
          className="custom-menu font-medium text-[15px]"
          active={window.location.pathname === "/document"}
          icon={<HomeOutlined />}
          onClick={() => handlePage("/document")}
        >
          Tài liệu
        </MenuItem>
        <MenuItem
          className="custom-menu font-medium text-[15px]"
          active={window.location.pathname === "/user"}
          icon={<HomeOutlined />}
          onClick={() => handlePage("/user")}
        >
          Nhân viên
        </MenuItem>
        <MenuItem
          className="custom-menu font-medium text-[15px]"
          active={window.location.pathname === "/role"}
          icon={<HomeOutlined />}
          onClick={() => handlePage("/role")}
        >
          Chức vụ
        </MenuItem>
        <MenuItem
          className="custom-menu font-medium text-[15px]"
          active={window.location.pathname === "/role-action"}
          icon={<HomeOutlined />}
          onClick={() => handlePage("/role-action")}
        >
          Quyền hạn
        </MenuItem>
      </Menu> */}

      <Menu>{menuItems}</Menu>
    </Sider>
  );
};

export default Sidebar;
