import React, { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { Layout, theme } from "antd";
const { Content } = Layout;

const Index = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <Layout
      style={{
        MinHeight: "100vh",
      }}
    >
      <Sidebar collapsed={collapsed} />
      <Layout
        style={{
          ...(!collapsed
            ? {
                marginLeft: "200px",
                transition: "margin 0.2s",
              }
            : {
                marginLeft: "80px",
                transition: "margin 0.2s",
              }),
        }}
      >
        <Header
          style={{ margin: "24px 0" }}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />

        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            background: colorBgContainer,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Index;
