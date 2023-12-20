import React, { useState, useEffect, useRef } from "react";
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
import SignatureCanvas from "react-signature-canvas";

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
  const [stampImage, setStampImage] = useState("");
  const [signatureImage, setSignatureImage] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    form.setFieldsValue({
      id: dataUser?._id,
      fullName: dataUser?.fullName,
      phoneNumber: dataUser?.phoneNumber,
    });
    setImageEditUrl(
      `${process.env.REACT_APP_API_URL}images/${dataUser?.avatar}`
    );
    setStampImage(dataUser?.stampImage);
    setSignatureImage(dataUser?.signatureImage);
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

  const convertToBase64 = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        resolve(event.target.result);
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsDataURL(file);
    });
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

  const handleChange1 = async (info, isEdit = false) => {
    if (info.file.status === "uploading") {
      setLoading(false);
      getBase64(info.file.originFileObj, (url) => {
        setLoading(false);
        setStampImage(url);
      });
      setStampImage(info.file.originFileObj);
      try {
        const base64 = await convertToBase64(info.file.originFileObj);
        console.log(base64);
        form.setFieldsValue({
          stampImage: base64,
        });
      } catch (error) {
        console.error("Error converting to base64:", error);
      }
    }
  };

  const signatureRef = useRef();

  const showSignatureModal = () => {
    setVisible(true);
  };

  const handleSave = () => {
    const signatureDataUrl = signatureRef.current.toDataURL();
    setSignatureImage(signatureDataUrl);
    form.setFieldsValue({
      signatureImage: signatureDataUrl,
    });
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

  const handleClear = () => {
    signatureRef.current.clear();
  };
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
            <Form.Item name="stampImage" label="Con dấu">
              <Space align="start">
                <Upload
                  name="stampImage"
                  className="avatar-uploader"
                  showUploadList={false}
                  listType="picture-circle"
                  fileList={[]}
                  customRequest={(option) =>
                    customUploadRequest(option, "avatar")
                  }
                  beforeUpload={beforeUpload}
                  onChange={(e) => handleChange1(e, true)}
                >
                  {stampImage ? (
                    <img
                      src={stampImage}
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
            <Form.Item label="Chữ ký" name="signatureImage">
              <SignatureCanvas
                ref={signatureRef}
                canvasProps={{
                  width: 450,
                  height: 200,
                  className: "sigCanvas",
                  style: {
                    border: "1px solid #000",
                  },
                }}
              />
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                }}
              >
                <Button key="save" type="primary" onClick={handleSave}>
                  Lưu
                </Button>
                <Button key="clear" type="primary" danger onClick={handleClear}>
                  Ký lại
                </Button>
              </div>
              {signatureImage && (
                <div>
                  Chữ ký hiện tại
                  <img src={signatureImage} alt="Chữ ký" />
                </div>
              )}
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
