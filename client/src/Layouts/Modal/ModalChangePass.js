import React, { useState, useEffect } from "react";
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
  Modal,
  Image,
  Divider,
} from "antd";
import { Col, Row } from "reactstrap";
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons";
const { Option } = Select;

export default function ModalChangePass({
  isModalChangePass,
  setIsModalChangePass,
  onFinish,
  form,
  dataUser,
  setImage,
  image,
  imageUrl,
  setImageUrl,
  imageEditUrl,
  setImageEditUrl,
}) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    form.setFieldsValue({
      id: dataUser?._id,
      fullName: dataUser?.fullName,
      phoneNumber: dataUser?.phoneNumber,
    });
    setImageEditUrl(
      `${process.env.REACT_APP_API_URL}images/${dataUser?.avatar}`
    );
  }, [isModalChangePass]);

  const handleCancel = () => {
    setIsModalChangePass(false);
    form.resetFields();
  };

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
    <div>
      <Modal
        footer={false}
        title="Cập nhật thông tin"
        open={isModalChangePass}
        onCancel={handleCancel}
      >
        <Divider />
        <Form
          onFinish={onFinish}
          form={form}
          name="basic"
          labelCol={{
            span: 24,
          }}
          wrapperCol={{
            span: "auto",
          }}
          style={{
            maxWidth: 500,
          }}
          initialValues={{
            remember: true,
          }}
          autoComplete="off"
        >
          <Row>
            <Col hidden={true}>
              <Form.Item name="id" label="Id">
                <Input name="id" />
              </Form.Item>
            </Col>

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
              name="password"
              label="Mật khẩu"
              rules={[
                {
                  type: "password",
                },
                {
                  type: "string",
                },
              ]}
            >
              <Input
                placeholder="Nhập mật khẩu..."
                name="password"
                allowClear={true}
              />
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
          </Row>

          <div className="text-right mt-10">
            <Space>
              <Button type="primary" danger onClick={handleCancel}>
                Hủy
              </Button>
              <Button htmlType="submit" type="primary" className="btn-modal">
                Xác nhận
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
