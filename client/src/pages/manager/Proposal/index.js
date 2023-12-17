import React, { useState, useEffect, useRef } from "react";
import { Col, Container, Row } from "reactstrap";
import {
  message,
  Input,
  Button,
  Form,
  Space,
  Tooltip,
  Drawer,
  Upload,
  Modal,
  Select,
  Tag,
} from "antd";
import {
  EyeOutlined,
  InboxOutlined,
  FolderViewOutlined,
} from "@ant-design/icons";
import {
  getPagingProposal,
  createProposal,
  getAllProject,
  getAllApprovalProcess,
} from "../../../services/api";
import moment from "moment";
import DataTable from "../../common/DataTable";
import SignatureCanvas from "react-signature-canvas";
import { useNavigate } from "react-router-dom";

const { Dragger } = Upload;
const { Option } = Select;

const Proposal = () => {
  document.title = "Quản lý đề xuất";

  const [form] = Form.useForm();
  const [formSearch] = Form.useForm();
  const navigate = useNavigate();
  const [listRole, setListRole] = useState([]);
  const [visibleForm, setVisibleForm] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState("");
  const [totalPage, setTotalPage] = useState(1);
  const [indexPage, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [signatureDataUrl, setSignatureDataUrl] = useState(null);
  const [visible, setVisible] = useState(false);
  const [file, setFile] = useState(null);
  const [approvalProcess, setApprovalProcess] = useState();
  const [project, setProject] = useState();
  const [contentData, setContentData] = useState("");
  const [type, setType] = useState(1);

  useEffect(() => {
    async function fetchData() {
      const dataRes = await getAllData();
      const dataProject = await getAllProject();
      const dataApproval = await getAllApprovalProcess();
      setListRole(dataRes);
      setApprovalProcess(dataApproval);
      setProject(dataProject);
    }
    fetchData();
  }, []);

  const signatureRef = useRef();

  const showSignatureModal = () => {
    setVisible(true);
  };

  const handleSave = () => {
    const signatureDataUrl = signatureRef.current.toDataURL();
    setSignatureDataUrl(signatureDataUrl);
    // const link = document.createElement("a");
    // link.href = signatureDataUrl;
    // link.download = "chuky.png";
    // link.click();
    setVisible(false);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const customRequest = ({ file, onSuccess, onError }) => {
    setFile(file);
    onSuccess();
  };

  const getAllData = async (_prams, indexPage = 1) => {
    try {
      const params = _prams
        ? _prams
        : {
            pageIndex: indexPage,
            pageSize: pageSize,
            search: "",
            type: type,
          };
      const dataRes = await getPagingProposal(params);
      setTotalPage(dataRes.totalPages);
      if (!dataRes) {
        return false;
      }
      console.log(dataRes);
      const data = convertDataTable(dataRes.data);
      setLoading(false);
      return dataRes?.data ? data : false;
    } catch (error) {
      message.error("Lấy danh sách đề xuất thất bại!");
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
          title: item?.title,
          file: item?.file,
          project: item?.project,
          category: item?.category,
          content: item?.content,
          selectedApprovalProcess: item?.selectedApprovalProcess,
          signatureImage: item?.signatureImage,
          createdBy: item?.createdBy?.fullName,
          status: item?.status,
          createdTime: moment(item?.createdTime).format("DD/MM/YYYY HH:mm"),
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
      type: type,
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
    const formData = new FormData();
    if (file) {
      formData.append("file", file);
    }

    formData.append("title", data.title);
    formData.append("signatureImage", signatureDataUrl);
    formData.append("category", data.category);
    formData.append("project", data.project);
    formData.append("content", contentData);
    formData.append("approvalProcessId", data.selectedApprovalProcess);

    if (!data.id) {
      //Save
      const dataRes = await createProposal(formData);
      dataRes.status === 1
        ? message.success(`Lưu thành công!`)
        : message.error(`Lưu thất bại!`);
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
    const dataRes = await getAllData({ pageIndex: 1, type: type });
    setListRole(dataRes);
    setPageIndex(1);
    setContentData("");
    form.resetFields();
    formSearch.resetFields();
  };

  const showInfo = (id) => {
    navigate(`/proposal/${id}`);
  };

  const columns = [
    {
      title: "id",
      dataIndex: "title",
    },

    {
      title: "Thời gian tạo",
      dataIndex: "createdTime",
    },
    {
      title: "Loại đề xuất",
      dataIndex: "category",
    },
    {
      title: "Nội dung trích yêu",
      dataIndex: "content",
    },
    {
      title: "Người đề xuất",
      dataIndex: "createdBy",
    },
    {
      title: "Người duyệt",
      dataIndex: "selectedApprovalProcess",
      render: (_, record) => {
        const userInfo = record.selectedApprovalProcess.steps.pop();
        if (record?.status === "Approved") {
          return userInfo?.approvers[0]?.user?.fullName;
        } else {
          return "Chưa được duyệt";
        }
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (_, { status }) => (
        <Tag
          color={
            status === "Approved"
              ? "green"
              : status === "Pending"
              ? "orange"
              : "red"
          }
          key={status}
        >
          {status === "Approved"
            ? "Đã duyệt"
            : status === "Pending"
            ? "Chờ duyệt"
            : "Đã từ chối"}
        </Tag>
      ),
    },
    // {
    //   title: "tài liệu",
    //   dataIndex: "file",
    //   render: (_, record) => (
    //     <a href={`${process.env.REACT_APP_API_URL}${record.file}`}>
    //       <Tooltip title="Tải file">
    //         <Button
    //           type="danger"
    //           shape="circle"
    //           icon={<FolderViewOutlined />}
    //           size="large"
    //         />
    //       </Tooltip>
    //     </a>
    //   ),
    // },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Tooltip title="xem">
          <Button
            type="danger"
            shape="circle"
            icon={<EyeOutlined />}
            size="large"
            onClick={() => showInfo(record.key)}
          />
        </Tooltip>
      ),
    },
  ];

  const onClose = () => {
    setVisibleForm(false);
    setSignatureDataUrl(null);
  };
  const showDrawer = () => {
    setVisibleForm(true);
  };
  const handleNewRole = () => {
    setDrawerTitle("Thêm Đề xuất");
    showDrawer();
    form.resetFields();
  };
  const handleCloseDrawer = () => {
    setDrawerTitle("");
    setVisibleForm(false);
    form.resetFields();
    setSignatureDataUrl(null);
  };
  const handleChangType = async (value) => {
    setType(value);

    const dataRes = await getAllData({ pageIndex: 1, type: value });
    setListRole(dataRes);
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Modal
          title="Ký tên"
          visible={visible}
          onOk={handleSave}
          onCancel={handleCancel}
          footer={[
            <Button key="save" type="primary" onClick={handleSave}>
              Lưu
            </Button>,
            <Button key="confirm" type="primary" onClick={handleSave}>
              Xác nhận
            </Button>,
            <Button key="cancel" onClick={handleCancel}>
              Đóng
            </Button>,
          ]}
        >
          <SignatureCanvas
            ref={signatureRef}
            canvasProps={{ width: 400, height: 200, className: "sigCanvas" }}
          />
        </Modal>

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
                  <Col sm={3}>
                    <Form.Item label="Loại đề xuất" style={{ width: "250px" }}>
                      <Select defaultValue={1} onChange={handleChangType}>
                        <Option key={1} value={1}>
                          Đề xuất của tôi
                        </Option>
                        <Option key={4} value={4}>
                          Đề xuất chờ duyệt
                        </Option>
                        <Option key={2} value={2}>
                          Đề xuất đã duyệt
                        </Option>
                        <Option key={3} value={3}>
                          Đề xuất đã từ chối
                        </Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item className="mt-3">
                  <Space>
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
                      name="title"
                      label="Tên đề xuất"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập tên đề xuất!",
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
                        placeholder="Nhập tên đề xuất..."
                        name="roleName"
                        allowClear={true}
                      />
                    </Form.Item>
                    <Form.Item
                      name="category"
                      label="Danh mục"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập danh mục!",
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
                        placeholder="Nhập danh mục..."
                        name="roleName"
                        allowClear={true}
                      />
                    </Form.Item>

                    <Form.Item
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn dự án!",
                        },
                        {
                          type: "string",
                          min: 1,
                        },
                      ]}
                      name="project"
                      label="Dự án"
                    >
                      <Select
                        placeholder="Chọn một dự án..."
                        allowClear
                        showSearch
                        name="project"
                      >
                        {project?.length > 0 &&
                          project?.map((item) => {
                            return (
                              <Option key={item._id} value={item._id}>
                                {item.projectName}
                              </Option>
                            );
                          })}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn quy trình duyệt!",
                        },
                        {
                          type: "string",
                          min: 1,
                        },
                      ]}
                      name="selectedApprovalProcess"
                      label="Quy trình duyệt"
                    >
                      <Select
                        placeholder="Chọn một quy trình duyệt..."
                        allowClear
                        showSearch
                        name="selectedApprovalProcess"
                      >
                        {approvalProcess?.length > 0 &&
                          approvalProcess?.map((item) => {
                            return (
                              <Option key={item._id} value={item._id}>
                                {item.processName}
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
                        Nội dung trích yếu
                      </label>
                    </div>
                    <textarea
                      value={contentData}
                      onChange={(e) => setContentData(e.target.value)}
                      className="form-control"
                      id="Input3"
                      rows="5"
                    ></textarea>
                    <Form.Item name="file" label="Tài liệu">
                      <Dragger name="file" customRequest={customRequest}>
                        <p className="ant-upload-drag-icon">
                          <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">Bấm hoặc thả file vào</p>
                      </Dragger>
                    </Form.Item>
                    <Form.Item label="Chữ ký">
                      {signatureDataUrl && (
                        <div>
                          <img src={signatureDataUrl} alt="Chữ ký" />
                        </div>
                      )}
                      <Button type="primary" onClick={showSignatureModal}>
                        Ký tên
                      </Button>
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

export default Proposal;
