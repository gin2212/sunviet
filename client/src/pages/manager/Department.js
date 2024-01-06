import React, { useEffect, useState } from "react";
import moment from "moment";
import {
  message,
  Input,
  Button,
  Form,
  Space,
  Tooltip,
  Drawer,
} from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Col, Container, Row } from "reactstrap";
import DataTable from "../common/DataTable";
import {
  getPagingDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../../services/api";

function Department() {
  document.title = "Quản lý phòng ban";
  const [form] = Form.useForm();
  const [listDepartments, setListDepartments] = useState();
  const [totalPage, setTotalPage] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [drawerTitle, setDrawerTitle] = useState();
  const [visibleForm, setVisibleForm] = useState(false);
  const [descriptionData, setDescriptionData] = useState("");
  const dataStorage = JSON.parse(localStorage.getItem("data"));

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const resDepartment = await getAllDepartment();

    setListDepartments(resDepartment || []);
  };
  const getAllDepartment = async (_prams) => {
    setLoading(true);
    try {
      const params = _prams
        ? _prams
        : {
            page: 1,
            limit: 10,
            search: "",
          };

      const res = await getPagingDepartment(params);
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
          departmentName: item?.departmentName,
          description: item?.description,
          createdBy: item?.createdBy?.fullName,
          createdTime: moment(item?.createdTime).format("DD/MM/YYYY HH:mm"),
        };
      });
    return data ? data : [];
  };

  const columns = [
    {
      title: "Tên phòng ban",
      dataIndex: "departmentName",
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
        listDepartments.length >= 1 &&
        dataStorage?.role?.roleName === "admin" ? (
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

    const dataRes = await getAllDepartment(params, indexPage);
    setListDepartments(dataRes);
  };

  const onFinish = async (data) => {
    console.log(data);
    const dataReq = {
      departmentName: data.departmentName,
      description: descriptionData,
    };
    if (!data.id) {
      //Save
      const dataRes = await createDepartment(dataReq);
      if (dataRes.status === 1) {
        message.success(`Lưu thành công!`);
        setVisibleForm(false);
        handleCloseDrawer();
      } else {
        message.error(`Lưu thất bại!`);
      }
    } else {
      //Update
      const dataRes = await updateDepartment(data.id, dataReq);
      if (dataRes.status === 1) {
        message.success(`Lưu thành công!`);
        handleCloseDrawer();
      } else {
        message.error(`Lưu thất bại!`);
      }
    }
    const dataRes = await getAllDepartment();
    setListDepartments(dataRes);
  };

  const handleRefresh = async () => {
    form.resetFields();
    setDescriptionData("");
    const dataRes = await getAllDepartment({ pageIndex: 1 });
    setListDepartments(dataRes);
    setPage(1);
  };

  const onEdit = async (key) => {
    const dataEdit = listDepartments.filter((item) => item.key === key);

    form.setFieldsValue({
      departmentName: dataEdit[0].departmentName,
      id: dataEdit[0].key,
    });
    setDescriptionData(
      dataEdit[0]?.description ? dataEdit[0]?.description : ""
    );
    setDrawerTitle("Sửa phòng ban");
    showDrawer();
  };

  const onDelete = async (key) => {
    if (window.confirm("Bạn có chắc muốn xóa không?")) {
      const dataRes = await deleteDepartment(key);
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
                    name="departmentName"
                    label="Tên phòng ban"
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
                      placeholder="Nhập tên menu..."
                      name="departmentName"
                      allowClear={true}
                    />
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
            listData={listDepartments}
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

export default Department;
