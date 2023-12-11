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
  Upload,
  DatePicker,
  Modal,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  InboxOutlined,
  FolderViewOutlined,
} from "@ant-design/icons";
import { Col, Container, Row } from "reactstrap";
import DataTable from "../common/DataTable";
import {
  getAllDepartments,
  getPagingDocument,
  createDocument,
  updateDocument,
  deleteDocument,
} from "../../services/api";
import dayjs from "dayjs";
import FileViewer from "react-file-viewer";

const { Option } = Select;
const { Dragger } = Upload;

function Document() {
  document.title = "Quản lý tài liệu";
  const [form] = Form.useForm();
  const [listDocument, setListDocuments] = useState();
  const [listDepartment, setListDepartment] = useState();
  const [totalPage, setTotalPage] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [drawerTitle, setDrawerTitle] = useState();
  const [visibleForm, setVisibleForm] = useState(false);
  const [contentData, setContentData] = useState("");
  const [file, setFile] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState();
  const [previewTitle, setPreviewTitle] = useState("");

  useEffect(() => {
    fetchData();
    fetchDataDepartment();
  }, []);

  const fetchDataDepartment = async () => {
    const resDepartment = await getAllDepartments();
    setListDepartment(resDepartment || []);
  };
  const fetchData = async () => {
    const resProject = await getDataDocument();

    setListDocuments(resProject || []);
  };
  const getDataDocument = async (_prams) => {
    setLoading(true);
    try {
      const params = _prams
        ? _prams
        : {
            page: 1,
            limit: 10,
            search: "",
          };

      const res = await getPagingDocument(params);
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
          title: item.title,
          file: item?.file,
          content: item?.content,
          issueDate: moment(item?.issueDate).format("DD/MM/YYYY"),
          authority: item?.authority,
          createdBy: item.createdBy.fullName,
          department: item?.department,
        };
      });
    return data ? data : [];
  };

  const columns = [
    {
      title: "Số ký hiệu",
      dataIndex: "title",
    },
    {
      title: "Ngày ban hành",
      dataIndex: "issueDate",
    },
    {
      title: "Cơ quan ban hành",
      dataIndex: "authority",
    },
    {
      title: "Nội dung trích yếu",
      dataIndex: "content",
      render: (_, { content }) => {
        return (
          <p
            style={{
              whiteSpace: "nowrap",
              maxWidth: "200px",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {content}
          </p>
        );
      },
    },
    {
      title: "Bộ phận lưu trữ",
      dataIndex: "department",
      render: (_, { department }) => {
        return department.departmentName;
      },
    },
    {
      title: "tài liệu",
      dataIndex: "file",
      render: (_, record) => (
        <Tooltip title="xem">
          <Button
            type="danger"
            shape="circle"
            icon={<FolderViewOutlined />}
            size="large"
            onClick={() =>
              handlePreview(`http://localhost:5555/${record.file}`)
            }
          />
        </Tooltip>
      ),
    },
    {
      title: "Hành động",
      dataIndex: "",
      render: (_, record) =>
        listDocument.length >= 1 ? (
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

    const dataRes = await getDataDocument(params, indexPage);
    setListDocuments(dataRes);
  };

  const onFinish = async (data) => {
    const formData = new FormData();
    if (file) {
      formData.append("file", file);
    }

    formData.append("title", data.title);
    formData.append("department", data.department);
    formData.append("content", contentData);
    formData.append("authority", data.authority);
    formData.append("issueDate", data.issueDate);

    if (!data.id) {
      //Save
      const dataRes = await createDocument(formData);
      if (dataRes.status === 1) {
        message.success(`Lưu thành công!`);
        setVisibleForm(false);
        handleCloseDrawer();
      } else {
        message.error(`Lưu thất bại!`);
      }
    } else {
      //Update
      const dataRes = await updateDocument(data.id, formData);
      if (dataRes.status === 1) {
        message.success(`Lưu thành công!`);
        handleCloseDrawer();
      } else {
        message.error(`Lưu thất bại!`);
      }
    }
    setFile(null);
    const dataRes = await getDataDocument();
    setListDocuments(dataRes);
  };

  const handleRefresh = async () => {
    form.resetFields();
    setContentData("");
    const dataRes = await getDataDocument({ pageIndex: 1 });
    setListDocuments(dataRes);
    setPage(1);
  };

  const onEdit = async (key) => {
    const dataEdit = listDocument.filter((item) => item.key === key);
    console.log(dataEdit);
    form.setFieldsValue({
      title: dataEdit[0].title,
      id: dataEdit[0].key,
      department: dataEdit[0].department?._id || null,
      issueDate: dataEdit[0].issueDate ? dayjs(dataEdit.issueDate) : null,
      authority: dataEdit[0].authority,
    });
    setContentData(dataEdit[0]?.content ? dataEdit[0]?.content : "");
    setFile(dataEdit[0].file);
    setDrawerTitle("Sửa phòng ban");
    showDrawer();
  };

  const onDelete = async (key) => {
    if (window.confirm("Bạn có chắc muốn xóa không?")) {
      const dataRes = await deleteDocument(key);
      dataRes.status === 1
        ? message.success(`Xóa thành công!`)
        : message.error(`Xóa thất bại!`);

      handleRefresh();
    }
  };

  const handleNewDepartment = () => {
    setDrawerTitle("Thêm tài liệu");
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

  const customRequest = ({ file, onSuccess, onError }) => {
    setFile(file);
    onSuccess();
  };

  const handlePreview = async (file) => {
    const url = new URL(file);

    // Lấy ra phần cuối của đường dẫn (tên file và định dạng)
    const fileNameWithExtension = url.pathname.split("/").pop();

    // Tách tên và định dạng sử dụng lastIndexOf và substring
    const lastDotIndex = fileNameWithExtension.lastIndexOf(".");
    const fileName = fileNameWithExtension.substring(0, lastDotIndex);
    const fileExtension = fileNameWithExtension.substring(lastDotIndex + 1);

    setPreviewImage({ file: file, fileExtension: fileExtension });

    setPreviewOpen(true);
    setPreviewTitle(fileName);
  };

  const handleCancel = () => setPreviewOpen(false);

  return (
    <React.Fragment>
      <Modal
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={handleCancel}
        width="80%"
        style={{
          maxHeight: "80%",
          overflowY: "scroll",
        }}
      >
        <FileViewer
          fileType={previewImage?.fileExtension}
          filePath={previewImage?.file}
          onError={(e) => console.log("Error:", e)}
        />
      </Modal>
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
                    name="title"
                    label="Số kí hiệu"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập số ký hiệu!",
                      },
                      {
                        type: "string",
                        min: 1,
                      },
                    ]}
                  >
                    <Input
                      placeholder="Nhập số ký hiệu..."
                      name="title"
                      allowClear={true}
                    />
                  </Form.Item>
                  <Form.Item
                    label="Ngày ban hành"
                    name="issueDate"
                    rules={[
                      {
                        required: true,
                        message: "Chọn thời gian ban hành!",
                      },
                    ]}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      format="DD/MM/YYYY"
                      placeholder="Chọn thời gian"
                    />
                  </Form.Item>
                  <Form.Item
                    name="authority"
                    label="Cơ quan chính phủ"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập cơ quan chính phủ!",
                      },
                      {
                        type: "string",
                        min: 1,
                      },
                    ]}
                  >
                    <Input
                      placeholder="Nhập cơ quan chính phủ..."
                      name="authority"
                      allowClear={true}
                    />
                  </Form.Item>
                  <Form.Item name="file" label="Tài liệu">
                    <Dragger name="file" customRequest={customRequest}>
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                      </p>
                      <p className="ant-upload-text">Bấm hoặc thả file vào</p>
                    </Dragger>
                  </Form.Item>
                  <Form.Item
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn cơ quan lưu trữ!",
                      },
                      {
                        type: "string",
                        min: 1,
                      },
                    ]}
                    name="department"
                    label="cơ quan lưu trữ"
                  >
                    <Select
                      placeholder="Chọn một cơ quan lưu trữ..."
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
            listData={listDocument}
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

export default Document;
