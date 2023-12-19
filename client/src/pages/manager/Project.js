import React, { useEffect, useState } from "react";
import moment from "moment";
import {
  message,
  Input,
  Button,
  Form,
  Space,
  Select,
  Tooltip,
  Drawer,
} from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Col, Container, Row } from "reactstrap";
import DataTable from "../common/DataTable";
import {
  getAllDepartments,
  getPagingProject,
  createProject,
  updateProject,
  deleteProject,
} from "../../services/api";

const { Option } = Select;

function Project() {
  document.title = "Quản lý dự án";
  const [form] = Form.useForm();
  const [listProjects, setListProjects] = useState();
  const [listDepartment, setListDepartment] = useState();
  const [totalPage, setTotalPage] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [drawerTitle, setDrawerTitle] = useState();
  const [visibleForm, setVisibleForm] = useState(false);
  const [descriptionData, setDescriptionData] = useState("");

  useEffect(() => {
    fetchData();
    fetchDataDepartment();
  }, []);

  const fetchDataDepartment = async () => {
    const resDepartment = await getAllDepartments();
    setListDepartment(resDepartment || []);
  };
  const fetchData = async () => {
    const resProject = await getDataProject();

    setListProjects(resProject || []);
  };
  const getDataProject = async (_prams) => {
    setLoading(true);
    try {
      const params = _prams
        ? _prams
        : {
            page: 1,
            limit: 10,
            search: "",
          };

      const res = await getPagingProject(params);
      setTotalPage(res?.totalPages * res?.pageSize);
      const data = convertDataTable(res?.data);
      setLoading(false);
      return res?.data ? data : [];
    } catch (error) {
      message.error("Lỗi khi lấy danh sách phòng ban: ", error);
    } finally {
      setLoading(false);
    }
  };

  const convertDataTable = (dataArray) => {
    let data =
      dataArray.length > 0 &&
      dataArray.map((item) => {
        return {
          key: item?._id,
          projectName: item?.projectName,
          description: item?.description,
          department: item?.department,
          createdBy: item?.createdBy?.fullName,
          createdTime: moment(item?.createdTime).format("DD/MM/YYYY HH:mm"),
        };
      });
    return data ? data : [];
  };

  const columns = [
    {
      title: "Tên dự án",
      dataIndex: "projectName",
    },
    {
      title: "Tên phòng ban",
      dataIndex: "department",
      render: (_, { department }) => {
        if (department?.departmentName) return department?.departmentName;
        else return "Chưa có phòng ban";
      },
    },
    {
      title: "Mô tả",
      dataIndex: "description",
    },
    {
      title: "Người tạo",
      dataIndex: "createdBy",
    },
    {
      title: "Thời gian tạo",
      dataIndex: "createdTime",
    },
    {
      title: "Hành động",
      dataIndex: "",
      render: (_, record) =>
        listProjects.length >= 1 ? (
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

  const showDrawer = () => {
    setVisibleForm(true);
  };

  const onPageChange = (page, page_size) => {
    setPage(page);
    setLimit(page_size);
    onPageChangeAtSearch(page, page_size);
  };

  const onPageChangeAtSearch = async (indexPage, page_size) => {
    const params = {
      pageIndex: indexPage,
      pageSize: page_size,
    };

    const dataRes = await getDataProject(params, indexPage);
    setListProjects(dataRes);
  };

  const onFinish = async (data) => {
    const dataReq = {
      projectName: data.projectName,
      description: descriptionData,
      department: data.department,
    };
    if (!data.id) {
      //Save
      const dataRes = await createProject(dataReq);
      if (dataRes.status === 1) {
        message.success(`Lưu thành công!`);
        setVisibleForm(false);
        handleCloseDrawer();
      } else {
        message.error(`Lưu thất bại!`);
      }
    } else {
      //Update
      const dataRes = await updateProject(data.id, dataReq);
      if (dataRes.status === 1) {
        message.success(`Lưu thành công!`);
        handleCloseDrawer();
      } else {
        message.error(`Lưu thất bại!`);
      }
    }
    const dataRes = await getDataProject();
    setListProjects(dataRes);
  };

  const handleRefresh = async () => {
    form.resetFields();
    setDescriptionData("");
    const dataRes = await getDataProject({ pageIndex: 1 });
    setListProjects(dataRes);
    setPage(1);
  };

  const onEdit = async (key) => {
    const dataEdit = listProjects.filter((item) => item.key === key);

    form.setFieldsValue({
      projectName: dataEdit[0].projectName,
      id: dataEdit[0].key,
      department: dataEdit[0].department?._id || null,
    });
    setDescriptionData(
      dataEdit[0]?.description ? dataEdit[0]?.description : ""
    );
    setDrawerTitle("Sửa phòng ban");
    showDrawer();
  };

  const onDelete = async (key) => {
    if (window.confirm("Bạn có chắc muốn xóa không?")) {
      const dataRes = await deleteProject(key);
      dataRes.status === 1
        ? message.success(`Xóa thành công!`)
        : message.error(`Xóa thất bại!`);

      handleRefresh();
    }
  };

  const handleNewDepartment = () => {
    setDrawerTitle("Thêm phòng ban");
    showDrawer();
    form.resetFields();
  };

  const onClose = () => {
    setVisibleForm(false);
  };

  const handleCloseDrawer = () => {
    setVisibleForm(false);
    form.resetFields();
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <div>
            <Drawer
              title={drawerTitle}
              placement={"right"}
              width={"70%"}
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
                    name="projectName"
                    label="Tên dự án"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập tên phòng ban!",
                      },
                      {
                        type: "string",
                        min: 1,
                      },
                    ]}
                  >
                    <Input
                      placeholder="Nhập tên dự án..."
                      name="projectName"
                      allowClear={true}
                    />
                  </Form.Item>
                  <Form.Item
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn một phòng ban!",
                      },
                      {
                        type: "string",
                        min: 1,
                      },
                    ]}
                    name="department"
                    label="Phòng ban"
                  >
                    <Select
                      placeholder="Chọn một phòng ban..."
                      allowClear
                      showSearch
                      name="department"
                    >
                      {listDepartment?.length > 0 &&
                        listDepartment?.map((item) => {
                          return (
                            <Option key={item._id} value={item._id}>
                              {item.departmentName}
                            </Option>
                          );
                        })}
                    </Select>
                  </Form.Item>
                  <div className="ant-col ant-form-item-label">
                    <label
                      htmlFor="content"
                      className="ant-form-item-required"
                      title="Post Content"
                    >
                      Mô tả
                    </label>
                  </div>
                  <textarea
                    value={descriptionData}
                    onChange={(e) => setDescriptionData(e.target.value)}
                    className="form-control"
                    id="Input3"
                    rows="5"
                  ></textarea>
                </Row>

                <Form.Item className="mt-3">
                  <Space>
                    <Button type="primary" htmlType="submit">
                      Lưu
                    </Button>
                    <Button type="danger" onClick={handleCloseDrawer}>
                      Đóng
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Drawer>
          </div>
          <Row>
            <Col xs={12}>
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                autoComplete="off"
              >
                <Col hidden={true}>
                  <Form.Item name="id" label="Id">
                    <Input name="id" />
                  </Form.Item>
                </Col>
                <Form.Item className="mt-3">
                  <Space>
                    <Button type="primary" onClick={handleNewDepartment}>
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

          <DataTable
            listData={listProjects}
            pageSize={limit}
            columns={columns}
            indexPage={page}
            totalPage={totalPage}
            onPageChange={onPageChange}
            loading={loading}
          />
        </Container>
      </div>
    </React.Fragment>
  );
}

export default Project;
