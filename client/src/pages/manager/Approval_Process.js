import React, { useEffect, useRef, useState } from "react";
import { SmileOutlined, UserOutlined } from "@ant-design/icons";
import {
  Avatar,
  Button,
  Form,
  Input,
  Tooltip,
  Modal,
  Space,
  Typography,
  Drawer,
  message,
  Select,
  Tag,
} from "antd";
import moment from "moment";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Col, Container, Row } from "reactstrap";
import DataTable from "../common/DataTable";
import {
  getAllUser,
  createApprovalProcess,
  updateApprovalProcess,
  getPagingApprovalProcess,
  deleteApprovalProcess,
} from "../../services/api";

const { Option } = Select;

const Approval_Process = () => {
  document.title = "Quản lý quy trình";
  const [form] = Form.useForm();
  const [listApprovalProcess, setListApprovalProcess] = useState();
  const [totalPage, setTotalPage] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [drawerTitle, setDrawerTitle] = useState();
  const [visibleForm, setVisibleForm] = useState(false);
  const [open, setOpen] = useState(false);
  const [listUser, setListUser] = useState();

  useEffect(() => {
    fetchData();
    fetchDataUser();
  }, []);

  const fetchData = async () => {
    const resProject = await getDataApprovalProcess();

    setListApprovalProcess(resProject || []);
  };
  const getDataApprovalProcess = async (_prams) => {
    setLoading(true);
    try {
      const params = _prams
        ? _prams
        : {
            page: 1,
            limit: 10,
            search: "",
          };

      const res = await getPagingApprovalProcess(params);
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
          processName: item.processName,
          steps: item.steps,
        };
      });
    return data ? data : [];
  };

  const columns = [
    {
      title: "Tên quy trình",
      dataIndex: "processName",
    },
    {
      title: "Quy trình duyệt",
      dataIndex: "steps",
      render: (_, record) => (
        <div>
          {record.steps?.map((step, index) => (
            <div key={index}>
              <p>{step.stepName}</p>
              {step?.approvers?.map((item, index1) => (
                <Tag
                  key={index1}
                  color="cyan"
                  style={{
                    marginLeft: 3,
                  }}
                >
                  {item.user.fullName}
                </Tag>
              ))}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Hành động",
      dataIndex: "",
      render: (_, record) =>
        listApprovalProcess.length >= 1 ? (
          <Space>
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
  const fetchDataUser = async () => {
    const resDepartment = await getAllUser();
    setListUser(resDepartment || []);
  };

  const showUserModal = () => {
    setOpen(true);
  };
  const hideUserModal = () => {
    setOpen(false);
  };

  const onFinish = async (data) => {
    const dataReq = {
      processName: data.processName,
      steps: data.users.map((userStep) => ({
        stepName: userStep.stepName,
        approvers: userStep.approvers.map((approver) => ({
          user: approver,
          status: "Pending",
        })),
        comments: [],
      })),
    };

    if (!data.id) {
      //Save
      const dataRes = await createApprovalProcess(dataReq);
      if (dataRes.status === 1) {
        message.success(`Lưu thành công!`);
        setVisibleForm(false);
        handleCloseDrawer();
      } else {
        message.error(`Lưu thất bại!`);
      }
    } else {
      //Update
      const dataRes = await updateApprovalProcess(data.id, dataReq);
      if (dataRes.status === 1) {
        message.success(`Lưu thành công!`);
        handleCloseDrawer();
      } else {
        message.error(`Lưu thất bại!`);
      }
    }

    const dataRes = await getDataApprovalProcess();
    setListApprovalProcess(dataRes);
  };

  const handleRefresh = async () => {
    form.resetFields();
    const dataRes = await getDataApprovalProcess({ pageIndex: 1 });
    setListApprovalProcess(dataRes);
    setPage(1);
  };

  const onDelete = async (key) => {
    if (window.confirm("Bạn có chắc muốn xóa không?")) {
      const dataRes = await deleteApprovalProcess(key);
      dataRes.status === 1
        ? message.success(`Xóa thành công!`)
        : message.error(`Xóa thất bại!`);

      handleRefresh();
    }
  };

  const handleNewApprovalProcess = () => {
    setDrawerTitle("Thêm quy trình");
    showDrawer();
    form.resetFields();
  };

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

    const dataRes = await getDataApprovalProcess(params, indexPage);
    setListApprovalProcess(dataRes);
  };

  const onClose = () => {
    setVisibleForm(false);
  };

  const handleCloseDrawer = () => {
    setVisibleForm(false);
    form.resetFields();
  };

  // reset form fields when modal is form, closed
  const useResetFormOnCloseModal = ({ form, open }) => {
    const prevOpenRef = useRef();
    useEffect(() => {
      prevOpenRef.current = open;
    }, [open]);
    const prevOpen = prevOpenRef.current;
    useEffect(() => {
      if (!open && prevOpen) {
        form.resetFields();
      }
    }, [form, prevOpen, open]);
  };
  const ModalForm = ({ open, onCancel }) => {
    const [form] = Form.useForm();
    useResetFormOnCloseModal({
      form,
      open,
    });
    const onOk = () => {
      form.submit();
    };
    return (
      <Modal title="Basic Drawer" open={open} onOk={onOk} onCancel={onCancel}>
        <Form form={form} layout="vertical" name="userForm">
          <Form.Item
            name="stepName"
            label="Tên bước"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập tên bước",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            rules={[
              {
                required: true,
                message: "Vui lòng chọn người duyệt!",
              },
            ]}
            name="approvers"
            label="Người duyệt"
          >
            <Select
              placeholder="Chọn một người duyệt"
              allowClear
              showSearch
              name="approvers"
              mode="multiple"
            >
              {listUser?.length > 0 &&
                listUser?.map((item) => {
                  return (
                    <Option key={item._id} value={item._id}>
                      {item.fullName}
                    </Option>
                  );
                })}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    );
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
              bosdyStyle={{
                paddingBottom: 80,
              }}
              style={{ marginTop: "70px" }}
            >
              <Form.Provider
                onFormFinish={(name, { values, forms }) => {
                  if (name === "userForm") {
                    const { basicForm } = forms;
                    const users = basicForm.getFieldValue("users") || [];
                    basicForm.setFieldsValue({
                      users: [...users, values],
                    });
                    setOpen(false);
                  }
                }}
              >
                <Form
                  name="basicForm"
                  onFinish={onFinish}
                  layout="vertical"
                  autoComplete="off"
                >
                  <Col hidden={true}>
                    <Form.Item name="id" label="Id">
                      <Input name="id" />
                    </Form.Item>
                  </Col>
                  <Form.Item
                    name="processName"
                    label="Tên quy trình"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập tên quy trình!",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>

                  {/* Create a hidden field to make Form instance record this */}
                  <Form.Item name="users" hidden />

                  <Form.Item
                    label="Bước duyệt"
                    shouldUpdate={(prevValues, curValues) =>
                      prevValues.users !== curValues.users
                    }
                  >
                    {({ getFieldValue }) => {
                      const users = getFieldValue("users") || [];
                      return users.length ? (
                        <ul>
                          {users.map((user, index) => (
                            <li key={index} className="user">
                              <Space>{user.stepName}</Space>
                              <div>
                                {user?.approvers?.map((item) => {
                                  return item;
                                })}
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <Typography.Text
                          className="ant-form-text"
                          type="secondary"
                        >
                          ( <SmileOutlined /> Chưa có bước duyệt )
                        </Typography.Text>
                      );
                    }}
                  </Form.Item>
                  <Form.Item>
                    <Space>
                      <Button
                        htmlType="button"
                        style={{
                          margin: "0 8px",
                        }}
                        onClick={showUserModal}
                      >
                        Thêm bước
                      </Button>
                      <Button type="primary" htmlType="submit">
                        Lưu
                      </Button>
                      <Button type="danger" onClick={handleCloseDrawer}>
                        Đóng
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>

                <ModalForm open={open} onCancel={hideUserModal} />
              </Form.Provider>
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
                    <Button type="primary" onClick={handleNewApprovalProcess}>
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
            listData={listApprovalProcess}
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
};
export default Approval_Process;
