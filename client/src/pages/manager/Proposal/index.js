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
  Table,
  Typography,
  InputNumber,
} from "antd";
import {
  EyeOutlined,
  InboxOutlined,
  SmileOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  getAllProposals,
  createProposal,
  getAllProject,
  getAllApprovalProcess,
  deleteProposal,
} from "../../../services/api";
import moment from "moment";
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
  const [loading, setLoading] = useState(true);
  const [signatureDataUrl, setSignatureDataUrl] = useState(null);
  const [visible, setVisible] = useState(false);
  const [file, setFile] = useState(null);
  const [approvalProcess, setApprovalProcess] = useState();
  const [project, setProject] = useState();
  const [contentData, setContentData] = useState("");
  const [type, setType] = useState(1);
  const dataStorage = JSON.parse(localStorage.getItem("data"));
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const dataProject = await getAllProject();
      const dataApproval = await getAllApprovalProcess();
      setApprovalProcess(dataApproval);
      setProject(dataProject);
    }
    fetchData();
  }, []);
  useEffect(() => {
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

  const showUserModal = () => {
    setOpen(true);
  };
  const hideUserModal = () => {
    setOpen(false);
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
      const dataRes = await getAllProposals();
      if (!dataRes) {
        return false;
      }

      const data = convertDataTable(dataRes);
      setLoading(false);
      return dataRes ? data : false;
    } catch (error) {
      message.error("Lấy danh sách đề xuất thất bại!");
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
          createdBy: item?.createdBy,
          status: item?.status,
          createdTime: moment(item?.createdTime).format("DD/MM/YYYY HH:mm"),
        };
      });
    return data ? data : [];
  };

  const fetchData = async () => {
    const resListRole = await getAllData();
    let listConver;
    if (dataStorage?.role?.roleName === "admin") {
      listConver = resListRole;
    } else if (type === 1) {
      listConver = resListRole?.filter(
        (item) => item?.createdBy?._id === dataStorage?._id
      );
    } else if (type === 2) {
      listConver = resListRole?.filter((proposal) => {
        let isCurrentUserCanSee = false;

        for (
          let i = 0;
          i < proposal.selectedApprovalProcess.steps.length;
          i++
        ) {
          const step = proposal.selectedApprovalProcess.steps[i];
          if (step.approvers.status === "Approved") {
            if (step.approvers.user._id === dataStorage?._id) {
              isCurrentUserCanSee = true;
              break;
            } else {
              break;
            }
          }
        }

        return isCurrentUserCanSee;
      });
    } else if (type === 3) {
      listConver = resListRole?.filter((proposal) => {
        let isCurrentUserCanSee = false;

        for (
          let i = 0;
          i < proposal.selectedApprovalProcess.steps.length;
          i++
        ) {
          const step = proposal.selectedApprovalProcess.steps[i];
          if (step.approvers.status === "Rejected") {
            if (step.approvers.user._id === dataStorage?._id) {
              isCurrentUserCanSee = true;
              break;
            } else {
              break;
            }
          }
        }

        return isCurrentUserCanSee;
      });
    } else {
      listConver = resListRole?.filter((proposal) => {
        let isCurrentUserCanSee = false;

        // Kiểm tra từng bước trong selectedApprovalProcess
        for (
          let i = 0;
          i < proposal.selectedApprovalProcess.steps.length;
          i++
        ) {
          const step = proposal.selectedApprovalProcess.steps[i];
          if (step.approvers.status === "Pending") {
            if (step.approvers.user._id === dataStorage?._id) {
              isCurrentUserCanSee = true;
              break;
            } else {
              break;
            }
          }
        }

        return isCurrentUserCanSee;
      });
    }

    setListRole(listConver);
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
    formData.append("proposalContent", JSON.stringify(data.proposalContent));

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
    const resListRole = await getAllData();
    let listConver;

    if (dataStorage?.role?.roleName === "admin") {
      listConver = resListRole;
    } else if (type === 1) {
      listConver = resListRole?.filter(
        (item) => item?.createdBy?._id === dataStorage?._id
      );
    } else if (type === 2) {
      listConver = resListRole?.filter((proposal) => {
        let isCurrentUserCanSee = false;

        for (
          let i = 0;
          i < proposal.selectedApprovalProcess.steps.length;
          i++
        ) {
          const step = proposal.selectedApprovalProcess.steps[i];
          if (step.approvers.status === "Approved") {
            if (step.approvers.user._id === dataStorage?._id) {
              isCurrentUserCanSee = true;
              break;
            } else {
              break;
            }
          }
        }

        return isCurrentUserCanSee;
      });
    } else if (type === 3) {
      listConver = resListRole?.filter((proposal) => {
        let isCurrentUserCanSee = false;

        for (
          let i = 0;
          i < proposal.selectedApprovalProcess.steps.length;
          i++
        ) {
          const step = proposal.selectedApprovalProcess.steps[i];
          if (step.approvers.status === "Rejected") {
            if (step.approvers.user._id === dataStorage?._id) {
              isCurrentUserCanSee = true;
              break;
            } else {
              break;
            }
          }
        }

        return isCurrentUserCanSee;
      });
    } else {
      listConver = resListRole?.filter((proposal) => {
        let isCurrentUserCanSee = false;

        // Kiểm tra từng bước trong selectedApprovalProcess
        for (
          let i = 0;
          i < proposal.selectedApprovalProcess.steps.length;
          i++
        ) {
          const step = proposal.selectedApprovalProcess.steps[i];
          if (step.approvers.status === "Pending") {
            if (step.approvers.user._id === dataStorage?._id) {
              isCurrentUserCanSee = true;
              break;
            } else {
              break;
            }
          }
        }

        return isCurrentUserCanSee;
      });
    }

    setListRole(listConver);
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
      render: (_, record) => {
        return record?.createdBy?.fullName;
      },
    },
    {
      title: "Người duyệt",
      dataIndex: "selectedApprovalProcess",
      render: (_, record) => {
        const userInfo =
          record.selectedApprovalProcess.steps[
            record.selectedApprovalProcess.steps.length - 1
          ];
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
      render: (_, record) => (
        <Tag
          color={
            record.selectedApprovalProcess.steps[
              record.selectedApprovalProcess.steps.length - 1
            ].approvers.status === "Approved"
              ? "green"
              : record.selectedApprovalProcess.steps[
                  record.selectedApprovalProcess.steps.length - 1
                ].approvers.status === "Pending"
              ? "orange"
              : "red"
          }
          key={
            record.selectedApprovalProcess.steps[
              record.selectedApprovalProcess.steps.length - 1
            ].approvers.status
          }
        >
          {record.selectedApprovalProcess.steps[
            record.selectedApprovalProcess.steps.length - 1
          ].approvers.status === "Approved"
            ? "Đã duyệt"
            : record.selectedApprovalProcess.steps[
                record.selectedApprovalProcess.steps.length - 1
              ].approvers.status === "Pending"
            ? "Chờ duyệt"
            : "Đã từ chối"}
        </Tag>
      ),
    },

    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <>
          <Tooltip title="xem">
            <Button
              type="primary"
              shape="circle"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => showInfo(record.key)}
            />
          </Tooltip>
          {dataStorage?.role?.roleName === "admin" && (
            <Tooltip title="Xóa">
              <Button
                style={{
                  marginLeft: "10px",
                }}
                type="primary"
                danger
                shape="circle"
                icon={<DeleteOutlined />}
                size="small"
                onClick={() => onDelete(record.key)}
              />
            </Tooltip>
          )}
        </>
      ),
    },
  ];

  const onDelete = async (key) => {
    if (window.confirm("Bạn có chắc muốn xóa không?")) {
      const dataRes = await deleteProposal(key);
      dataRes.status === 1
        ? message.success(`Xóa thành công!`)
        : message.error(`Xóa thất bại!`);

      handleRefresh();
    }
  };

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
    const resListRole = await getAllData();
    let listConver;

    if (dataStorage?.role?.roleName === "admin") {
      listConver = resListRole;
    } else if (value === 1) {
      listConver = resListRole?.filter(
        (item) => item?.createdBy?._id === dataStorage?._id
      );
    } else if (value === 2) {
      listConver = resListRole?.filter((proposal) =>
        proposal.selectedApprovalProcess.steps.some(
          (step) =>
            step.approvers.status === "Approved" &&
            step.approvers.user._id === dataStorage?._id
        )
      );
    } else if (value === 3) {
      listConver = resListRole?.filter((proposal) =>
        proposal.selectedApprovalProcess.steps.some(
          (step) =>
            step.approvers.status === "Rejected" &&
            step.approvers.user._id === dataStorage?._id
        )
      );
    } else {
      listConver = resListRole?.filter((proposal) => {
        let isCurrentUserCanSee = false;

        // Kiểm tra từng bước trong selectedApprovalProcess
        for (
          let i = 0;
          i < proposal.selectedApprovalProcess.steps.length;
          i++
        ) {
          const step = proposal.selectedApprovalProcess.steps[i];
          if (step.approvers.status === "Pending") {
            if (step.approvers.user._id === dataStorage?._id) {
              isCurrentUserCanSee = true;
              break;
            } else {
              break;
            }
          }
        }

        return isCurrentUserCanSee;
      });
    }

    setListRole(listConver);
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
      <Modal
        title="Thêm nội dung đề xuất"
        open={open}
        onOk={onOk}
        onCancel={onCancel}
      >
        <Form form={form} layout="vertical" name="proposalContentForm">
          <Form.Item
            name="content"
            label="Nội dung"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập nội dung",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="agency"
            label="Đơn vị"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập đơn vị",
              },
            ]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="mass"
            label="Khối lượng"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập khối lượng",
              },
            ]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="unitPrice"
            label="Đơn giá"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập đơn giá",
              },
            ]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="totalCost"
            label="Thành tiền"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập thành tiền",
              },
            ]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="descripton" label="Ghi chú">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    );
  };

  const handleClear = () => {
    signatureRef.current.clear();
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
            <Button key="clear" type="primary" danger onClick={handleClear}>
              Ký lại
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
                {dataStorage?.role?.roleName !== "admin" && (
                  <Row>
                    <Col sm={3}>
                      <Form.Item
                        label="Loại đề xuất"
                        style={{ width: "250px" }}
                      >
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
                )}

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
                <Form.Provider
                  onFormFinish={(name, { values, forms }) => {
                    if (name === "proposalContentForm") {
                      const { basicForm } = forms;
                      const proposalContent =
                        basicForm.getFieldValue("proposalContent") || [];
                      basicForm.setFieldsValue({
                        proposalContent: [...proposalContent, values],
                      });
                      setOpen(false);
                    }
                  }}
                >
                  <Form
                    name="basicForm"
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
                          <p className="ant-upload-text">
                            Bấm hoặc thả file vào
                          </p>
                        </Dragger>
                      </Form.Item>
                      <Form.Item name="proposalContent" hidden />
                      <Form.Item
                        label="Nội dung đề xuất"
                        shouldUpdate={(prevValues, curValues) =>
                          prevValues.users !== curValues.users
                        }
                      >
                        {({ getFieldValue }) => {
                          const proposalContent =
                            getFieldValue("proposalContent") || [];
                          return proposalContent.length ? (
                            <>
                              <ul>
                                {proposalContent.map((proposal, index) => (
                                  <li key={index} className="proposalContent">
                                    {`${index + 1} - ${proposal?.content} - ${
                                      proposal?.agency
                                    } - ${proposal?.mass} - ${
                                      proposal?.unitPrice
                                    } - ${proposal?.totalCost} - ${
                                      proposal?.descripton
                                    }`}
                                  </li>
                                ))}
                              </ul>
                              <Button htmlType="button" onClick={showUserModal}>
                                Thêm nội dung
                              </Button>
                            </>
                          ) : (
                            <div>
                              <Typography.Text
                                className="ant-form-text"
                                type="secondary"
                              >
                                ( <SmileOutlined /> Chưa có nội dung )
                              </Typography.Text>
                              <Button htmlType="button" onClick={showUserModal}>
                                Thêm nội dung
                              </Button>
                            </div>
                          );
                        }}
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
                          danger
                          onClick={handleCloseDrawer}
                        >
                          Đóng
                        </Button>
                      </Space>
                    </Form.Item>
                  </Form>
                  <ModalForm open={open} onCancel={hideUserModal} />
                </Form.Provider>
              </Drawer>
            </Col>
          </div>
          <Table
            columns={columns}
            dataSource={listRole}
            // pagination={tableParams.pagination}
            loading={loading}
            // onChange={handleTableChange}
          />
          {/* <DataTable
            listData={listRole}
            pageSize={pageSize}
            columns={columns}
            indexPage={indexPage}
            totalPage={totalPage}
            onPageChange={onPageChange}
            loading={loading}
          /> */}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Proposal;
