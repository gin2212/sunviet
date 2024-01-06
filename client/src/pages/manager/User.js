import React, { useState, useEffect, useRef } from "react";
import { Col, Container, Row } from "reactstrap";
import {
  message,
  Input,
  Button,
  Form,
  Space,
  Select,
  Tooltip,
  Drawer,
  Upload,
  Image,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import {
  deleteUser,
  getAllRole,
  getPagingUser,
  createUser,
  updateUser,
  getAllDepartments,
} from "../../services/api";
import moment from "moment";
import DataTable from "../common/DataTable";

const { Option } = Select;

const listStatus = [
  { value: 1, label: "Kích hoạt" },
  { value: 2, label: "Ngưng kích hoạt" },
];

const Users = () => {
  document.title = "Quản lý nhân viên";

  const [form] = Form.useForm();
  const [formSearch] = Form.useForm();
  const [listUser, setListUser] = useState([]);
  const [listRole, setListRole] = useState([]);
  const [visibleForm, setVisibleForm] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState("");
  const [totalPage, setTotalPage] = useState(1);
  const [indexPage, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState();
  const [imageUrl, setImageUrl] = useState();
  const [imageEditUrl, setImageEditUrl] = useState();
  const [listDepartment, setListDepartment] = useState();
  const dataStorage = JSON.parse(localStorage.getItem("data"));

  useEffect(() => {
    async function fetchData() {
      const dataRes = await getAllData();
      setListUser(dataRes);
      const resListRole = await getAllRole();
      const newListRole = resListRole.filter(
        (item) => item.roleName !== "admin"
      );
      setListRole(newListRole);
      const resDepartment = await getAllDepartments();
      setListDepartment(resDepartment);
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
      const dataRes = await getPagingUser(params);
      setTotalPage(dataRes.totalPages);
      if (!dataRes) {
        return false;
      }
      const data = convertDataTable(dataRes.data);
      setLoading(false);
      return dataRes?.data ? data : false;
    } catch (error) {
      message.error("Bạn không có quyền lấy tất cả thông tin hoạt động!");
      setTotalPage(0);
      return [];
    }
  };

  const convertDataTable = (dataArray) => {
    const data =
      dataArray?.length > 0 &&
      dataArray?.map((item) => {
        return {
          key: item?._id,
          ...item,
          userName: item?.userName,
          fullName: item?.fullName,
          email: item?.email,
          phoneNumber: item?.phoneNumber,
          roleName: item?.role?.roleName,
          department: item?.department,
          activeStatus:
            item?.activeStatus === 1 ? "Kích hoạt" : "Ngưng kích hoạt",
          createdTime: moment(new Date(item.createdTime)).format("DD/MM/YYYY"),
        };
      });
    return dataArray ? data : [];
  };

  const onPageChange = (page, page_size) => {
    setPageIndex(page);
    setPageSize(page_size);
    onPageChangeAtSearch(page, page_size);
  };

  const onPageChangeAtSearch = async (indexPage, page_size) => {
    const params = {
      pageIndex: indexPage,
      pageSize: page_size,
      ...getFormSearch(),
    };

    const dataRes = await getAllData(params, indexPage);
    setListUser(dataRes);
  };

  const getFormSearch = () => {
    const dataForm = formSearch.getFieldsValue();

    return {
      userName: dataForm.userName || "",
    };
  };

  const onFinish = async (data) => {
    const formData = new FormData();

    if (image) {
      formData.append("image", image);
    }

    if (data.password) {
      formData.append("password", data.password);
    }

    formData.append("email", data.email);
    formData.append("fullName", data.fullName);
    formData.append("phoneNumber", data.phoneNumber);
    formData.append("activeStatus", data.activeStatus);
    formData.append("role", data.role);
    formData.append("department", data.department);

    if (!data.id) {
      //Save
      const dataRes = await createUser(formData);
      dataRes.status === 1
        ? message.success(`Lưu thành công!`)
        : message.error(`Lưu thất bại!`);
      if (dataRes.status === 1) {
        onClose();
      }
    } else {
      //Update
      const dataRes = await updateUser(data.id, formData);
      dataRes.status === 1
        ? message.success(`Cập nhật thành công!`)
        : message.error(`Cập nhật thất bại!`);
      if (dataRes.status === 1) {
        onClose();
      }
    }

    form.resetFields();
    formSearch.resetFields();
    handleRefresh();
    const dataRes = await getAllData();
    setListUser(dataRes);
  };

  const handleRefresh = async () => {
    const dataRes = await getAllData({ pageIndex: 1 });
    setListUser(dataRes);
    setPageIndex(1);
    form.resetFields();
  };
  const handleRefreshSearch = async () => {
    formSearch.resetFields();
    const dataRes = await getAllData();
    setListUser(dataRes);
  };

  const handleSearch = async () => {
    const dataForm = formSearch.getFieldsValue();
    const params = {
      pageIndex: 1,
      pageSize: 10,
      search: dataForm.email ? dataForm.email : "",
    };

    const dataRes = await getAllData(params);
    setListUser(dataRes);
  };
  const onClose = () => {
    setVisibleForm(false);
  };
  const showDrawer = () => {
    setVisibleForm(true);
  };
  const handleNewUser = () => {
    setDrawerTitle("Thêm nhân viên");
    showDrawer();
    form.resetFields();
  };
  const onEdit = (key) => {
    const dataEdit = listUser.filter((item) => item.key === key);
    const dataRole = listRole.filter(
      (item) => item.roleName === dataEdit[0].roleName
    );
    const dataStatus = listStatus.filter(
      (item) => item.label === dataEdit[0].activeStatus
    );

    form.setFieldsValue({
      id: dataEdit[0]?.key,
      userName: dataEdit[0]?.userName,
      fullName: dataEdit[0]?.fullName,
      phoneNumber: dataEdit[0]?.phoneNumber,
      email: dataEdit[0]?.email,
      activeStatus: dataStatus[0]?.value,
      roleName: dataRole[0]?.roleName,
      role: dataRole[0]?._id,
      urlSocical: dataEdit[0]?.urlSocical,
      department: dataEdit[0]?.department?._id || null,
    });
    setImageEditUrl(
      `${process.env.REACT_APP_API_URL}images/${dataEdit[0]?.avatar}`
    );
    setDrawerTitle("Sửa nhân viên");
    showDrawer();
  };

  const onDelete = async (key) => {
    if (window.confirm("Bạn có chắc muốn xóa không?")) {
      const dataRes = await deleteUser(key);
      dataRes.status === 1
        ? message.success(`Xóa thành công!`)
        : message.error(`Xóa thất bại!`);

      handleRefreshSearch();
    }
  };

  const columns = [
    {
      title: "Ảnh đại diện",
      dataIndex: "avatar",
      render: (_, record) => {
        if (_) {
          return (
            <Image
              width={150}
              src={`${process.env.REACT_APP_API_URL}images/${record.avatar}`}
            />
          );
        } else {
          return <></>;
        }
      },
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Tên người dùng",
      dataIndex: "fullName",
    },

    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
    },
    {
      title: "Thời gian tạo",
      dataIndex: "createdTime",
    },
    {
      title: "Quyền",
      dataIndex: "roleName",
    },
    {
      title: "Trạng thái",
      dataIndex: "activeStatus",
    },
    {
      title: "Phòng ban",
      dataIndex: "department",
      render: (_, { department }) => {
        if (department?.departmentName) return department?.departmentName;
        else return "Chưa có phòng ban";
      },
    },
    {
      title: "Hành động",
      dataIndex: "",
      render: (_, record) =>
        listUser?.length >= 1 && dataStorage?.role?.roleName === "admin" ? (
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

  const customUploadRequest = async () => {
    message.success("upload hình thành công");
  };
  const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(reader.result));
    reader.readAsDataURL(img);
  };
  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG file!");
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Image must smaller than 2MB!");
    }
    return isJpgOrPng && isLt2M;
  };

  const handleChange = (info, isEdit = false) => {
    if (info.file.status === "uploading") {
      setLoading(false);
      getBase64(info.file.originFileObj, (url) => {
        setLoading(false);
        isEdit ? setImageEditUrl(url) : setImageUrl(url);
      });
      setImage(info.file.originFileObj);
    }
  };

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div
        style={{
          marginTop: 8,
        }}
      >
        Upload
      </div>
    </div>
  );

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <div>
            <Col>
              <Drawer
                title={drawerTitle}
                placement={"right"}
                width={"50%"}
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
                      name="email"
                      label="Email"
                      rules={[
                        {
                          type: "email",
                        },
                        {
                          type: "string",
                          min: 1,
                        },
                      ]}
                    >
                      <Input
                        placeholder="Nhập địa chỉ email..."
                        name="email"
                        allowClear={true}
                      />
                    </Form.Item>

                    <Form.Item
                      name="password"
                      label="Mật khẩu"
                      rules={[
                        {
                          required:
                            drawerTitle == "Sửa nhân viên" ? false : true,
                          message: "Vui lòng nhập mật khẩu!",
                        },
                        {
                          type: "password",
                        },
                        {
                          type: "string",
                          min: 1,
                        },
                      ]}
                    >
                      <Input
                        placeholder="Nhập mật khẩu..."
                        name="password"
                        allowClear={true}
                      />
                    </Form.Item>

                    <Form.Item
                      name="fullName"
                      label="Tên người dùng"
                      rules={[
                        {
                          type: "fullName",
                        },
                        {
                          type: "string",
                          min: 1,
                        },
                      ]}
                    >
                      <Input
                        placeholder="Nhập tên người dùng..."
                        name="fullName"
                        allowClear={true}
                      />
                    </Form.Item>

                    <Form.Item name="phoneNumber" label="Số điện thoại">
                      <Input
                        placeholder="Nhập số điện thoại..."
                        name="phoneNumber"
                        allowClear={true}
                      />
                    </Form.Item>

                    <Form.Item
                      name="role"
                      label="Chức vụ"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn một chức vụ!",
                        },
                      ]}
                    >
                      <Select
                        placeholder="Chọn một chức vụ..."
                        allowClear
                        showSearch
                        name="roles"
                      >
                        {listRole?.length > 0 &&
                          listRole.map((item) => {
                            return (
                              <Option key={item._id} value={item._id}>
                                {item.roleName}
                              </Option>
                            );
                          })}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      name="department"
                      label="Phòng ban"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn một phòng ban!",
                        },
                      ]}
                    >
                      <Select
                        placeholder="Chọn một phòng ban..."
                        allowClear
                        showSearch
                        name="department"
                      >
                        {listDepartment?.length > 0 &&
                          listDepartment.map((item) => {
                            return (
                              <Option key={item._id} value={item._id}>
                                {item.departmentName}
                              </Option>
                            );
                          })}
                      </Select>
                    </Form.Item>

                    <Form.Item name="avatar" label="Ảnh đại diện" className="">
                      <Space align="start">
                        <Upload
                          name="avatar"
                          listType="picture-circle"
                          className="avatar-uploader"
                          showUploadList={false}
                          fileList={[]}
                          customRequest={(option) =>
                            customUploadRequest(option, "avatar")
                          }
                          beforeUpload={beforeUpload}
                          onChange={(e) => handleChange(e, true)}
                        >
                          {imageEditUrl ? (
                            <img
                              src={imageEditUrl}
                              alt="avatar"
                              style={{
                                width: "100%",
                                height: "100%",
                                borderRadius: "50%",
                                objectFit: "contain",
                              }}
                            />
                          ) : (
                            uploadButton
                          )}
                        </Upload>
                      </Space>
                    </Form.Item>

                    <Form.Item
                      name="activeStatus"
                      label="Trạng thái"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn một trạng thái!",
                        },
                      ]}
                    >
                      <Select
                        placeholder="Chọn một trạng thái..."
                        allowClear
                        showSearch
                        name="activeStatus"
                      >
                        {listStatus?.length > 0 &&
                          listStatus.map((item) => {
                            return (
                              <Option key={item.value} value={item.value}>
                                {item.label}
                              </Option>
                            );
                          })}
                      </Select>
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
                        onClick={() => handleRefresh()}
                      >
                        Làm mới
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              </Drawer>
            </Col>
          </div>
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
                      name="userName"
                      label="Tên đăng nhập"
                      rules={[
                        {
                          required: false,
                          message: "Please input user name!",
                        },
                        {
                          type: "userName",
                        },
                        {
                          type: "string",
                          min: 1,
                        },
                      ]}
                    >
                      <Input
                        placeholder="Nhập tên đăng nhập..."
                        name="userName"
                        allowClear={true}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item className="mt-3">
                  <Space>
                    <Button type="primary" onClick={handleNewUser}>
                      Tạo mới
                    </Button>
                    <Button
                      type="primary"
                      htmlType="button"
                      onClick={() => handleRefreshSearch()}
                    >
                      Làm mới trang
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Col>
          </Row>
          <DataTable
            listData={listUser}
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

export default Users;
