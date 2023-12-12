import React, { useState, useEffect } from "react";
import { Col, Container, Row } from "reactstrap";
import { message, Input, Button, Form, Space, Tooltip, Drawer } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import {
  deleteRole,
  getPagingRole,
  createRole,
  updateRole,
} from "../../services/api";
import moment from "moment";
import DataTable from "../common/DataTable";

const Roles = () => {
  document.title = "Management Roles";

  const [form] = Form.useForm();
  const [formSearch] = Form.useForm();
  const [listRole, setListRole] = useState([]);
  const [visibleForm, setVisibleForm] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState("");
  const [totalPage, setTotalPage] = useState(1);
  const [indexPage, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const dataRes = await getAllData();
      setListRole(dataRes);
    }
    fetchData();
  }, []);

  const getAllData = async (_prams, indexPage = 1) => {
    try {
      const params = _prams
        ? _prams
        : {
            pageIndex: indexPage,
            pageSize: pageSize,
            search: "",
          };
      const dataRes = await getPagingRole(params);
      setTotalPage(dataRes.totalPages);
      if (!dataRes) {
        return false;
      }
      const data = convertDataTable(dataRes.data);
      setLoading(false);
      return dataRes?.data ? data : false;
    } catch (error) {
      message.error("Lấy danh sách role thất bại!");
      setTotalPage(0);
      return [];
    }
  };

  const convertDataTable = (dataArray) => {
    const data =
      dataArray.length > 0 &&
      dataArray.map((item) => {
        return {
          key: item?._id,
          roleName: item?.roleName,
          createdTime: moment(new Date(item.createdTime)).format("DD/MM/YYYY"),
        };
      });
    return data ? data : [];
  };

  const onPageChange = (page, page_size) => {
    setPageIndex(page);
    setPageSize(page_size);
    onPageChangeAtSearch(page, page_size);
  };

  const fetchData = async () => {
    const resListRole = await getAllData();
    setListRole(resListRole);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onPageChangeAtSearch = async (indexPage, page_size) => {
    const params = {
      pageIndex: indexPage,
      pageSize: page_size,
      ...getFormSearch(),
    };

    const dataRes = await getAllData(params, indexPage);
    setListRole(dataRes);
  };

  const getFormSearch = () => {
    const dataForm = formSearch.getFieldsValue();

    return {
      roleName: dataForm.roleName || "",
    };
  };

  const onFinish = async (data) => {
    const dataReq = {
      roleName: data.roleName,
    };

    if (!data.id) {
      //Save
      const dataRes = await createRole(dataReq);
      dataRes.status === 1
        ? message.success(`Lưu thành công!`)
        : message.error(`Lưu thất bại!`);
    } else {
      //Update
      const dataRes = await updateRole(data.id, dataReq);
      dataRes.status === 1
        ? message.success(`Cập nhật thành công!`)
        : message.error(`Cập nhật thất bại!`);
    }
    formSearch.resetFields();
    form.resetFields();
    handleCloseDrawer();
    handleRefresh();
  };
  const handleRefreshCreate = () => {
    form.resetFields();
  };
  const handleRefresh = async () => {
    const dataRes = await getAllData({ pageIndex: 1 });
    setListRole(dataRes);
    setPageIndex(1);
    form.resetFields();
    formSearch.resetFields();
  };

  const handleSearch = async () => {
    const dataForm = formSearch.getFieldsValue();
    const params = {
      pageIndex: 1,
      pageSize: 10,
      search: dataForm.roleName ? dataForm.roleName : "",
    };
    const dataRes = await getAllData(params);
    setListRole(dataRes);
  };

  const onEdit = (key) => {
    const dataEdit = listRole.filter((item) => item.key === key);

    form.setFieldsValue({
      roleName: dataEdit[0].roleName,
      id: dataEdit[0].key,
    });
    setDrawerTitle("Sửa quyền");
    showDrawer();
  };

  const onDelete = async (key) => {
    if (window.confirm("Bạn có chắc muốn xóa không?")) {
      const dataRes = await deleteRole(key);

      dataRes.status === 1
        ? message.success(`Xóa thành công!`)
        : message.error(`Xóa thất bại, quyền đang được sử dụng!`);

      handleRefresh();
    }
  };

  const columns = [
    {
      title: "Chức vụ",
      dataIndex: "roleName",
    },
    {
      title: "Thời gian tạo",
      dataIndex: "createdTime",
    },
    {
      title: "Hành động",
      dataIndex: "",
      render: (_, record) =>
        listRole.length >= 1 ? (
          <Space>
            <Tooltip title="Sửa">
              <Button
                type="primary"
                shape="circle"
                icon={<EditOutlined />}
                size="small"
                onClick={() => onEdit(record.key)}
              />
            </Tooltip>
            <Tooltip title="Xóa">
              <Button
                type="danger"
                shape="circle"
                icon={<DeleteOutlined />}
                size="small"
                onClick={() => onDelete(record.key)}
              />
            </Tooltip>
          </Space>
        ) : null,
    },
  ];

  const onClose = () => {
    setVisibleForm(false);
  };
  const showDrawer = () => {
    setVisibleForm(true);
  };
  const handleNewRole = () => {
    setDrawerTitle("Thêm quyền");
    showDrawer();
    form.resetFields();
  };
  const handleCloseDrawer = () => {
    setDrawerTitle("");
    setVisibleForm(false);
    form.resetFields();
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Row>
            <Col xs={12}>
              <Form
                form={formSearch}
                layout="vertical"
                onFinish={onFinish}
                autoComplete="off"
              >
                <Row>
                  <Col hidden={true}>
                    <Form.Item name="id" label="Id">
                      <Input name="id" />
                    </Form.Item>
                  </Col>
                  <Col sm={3}>
                    <Form.Item
                      name="roleName"
                      label="Tìm kiếm theo chức vụ"
                      rules={[
                        {
                          required: false,
                          message: "vui lòng nhập chức vụ!",
                        },
                        {
                          type: "roleName",
                        },
                        {
                          type: "string",
                          min: 1,
                        },
                      ]}
                    >
                      <Input
                        placeholder="Nhập chức vụ..."
                        name="roleName"
                        allowClear={true}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item className="mt-3">
                  <Space>
                    <Button
                      type="primary"
                      htmlType="button"
                      onClick={() => handleSearch()}
                    >
                      Tìm kiếm
                    </Button>
                    <Button type="primary" onClick={handleNewRole}>
                      Tạo mới
                    </Button>
                    <Button
                      type="primary"
                      htmlType="button"
                      onClick={() => handleRefresh()}
                    >
                      Làm mới trang
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Col>
          </Row>
          <div>
            <Col>
              <Drawer
                title={drawerTitle}
                placement={"right"}
                width={"30%"}
                onClose={onClose}
                open={visibleForm}
                bodyStyle={{
                  paddingBottom: 80,
                }}
                style={{ marginTop: "70px" }}
              >
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={onFinish}
                  autoComplete="off"
                >
                  <Row>
                    <Col hidden={true}>
                      <Form.Item name="id" label="Id">
                        <Input name="id" />
                      </Form.Item>
                    </Col>
                    <Form.Item
                      name="roleName"
                      label="Chức vụ"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập chức vụ!",
                        },
                        {
                          type: "roleName",
                        },
                        {
                          type: "string",
                          min: 1,
                        },
                      ]}
                    >
                      <Input
                        placeholder="Nhập chức vụ..."
                        name="roleName"
                        allowClear={true}
                      />
                    </Form.Item>
                  </Row>
                  <Form.Item className="mt-3">
                    <Space>
                      <Button type="primary" htmlType="submit">
                        Lưu
                      </Button>
                      <Button
                        type="primary"
                        htmlType="button"
                        onClick={() => handleRefreshCreate()}
                      >
                        Làm mới trang
                      </Button>
                      <Button type="danger" onClick={handleCloseDrawer}>
                        Đóng
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              </Drawer>
            </Col>
          </div>
          <DataTable
            listData={listRole}
            pageSize={pageSize}
            columns={columns}
            indexPage={indexPage}
            totalPage={totalPage}
            onPageChange={onPageChange}
            loading={loading}
          />
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Roles;
