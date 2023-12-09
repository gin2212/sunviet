import React from "react";
import { Modal, Divider, Form, Input, Space, Button } from "antd";

export default function ModalChangePass({
  isModalChangePass,
  setIsModalChangePass,
  onFinish,
  form,
}) {
  const handleCancel = () => {
    setIsModalChangePass(false);
    form.resetFields();
  };

  // const formattedDate = userInfo?.created_at
  //     ? moment(userInfo?.created_at).format("DD/MM/YYYY HH:mm")
  //     : "";

  return (
    <div>
      <Modal
        footer={false}
        title="Đổi mật khẩu"
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
          <Form.Item
            label="Mật khẩu cũ"
            name="oldPassword"
            style={{ marginBottom: "10px" }}
            rules={[
              {
                required: true,
                message: "Nhập mật khẩu cũ!",
              },
            ]}
          >
            <Input.Password allowClear />
          </Form.Item>
          <Form.Item
            style={{ marginBottom: "10px" }}
            label="Mật khẩu mới"
            name="password"
            rules={[
              {
                required: true,
                message: "Nhập mật khẩu mới!",
              },
            ]}
          >
            <Input.Password allowClear />
          </Form.Item>
          {/* <Form.Item
                        label="Nhập lại mật khẩu mới"
                        name="confirmPassword"
                        rules={[
                            {
                                required: true,
                                message: "Nhập lại mật khẩu mới!",
                            },
                        ]}
                    >
                        <Input.Password allowClear />
                    </Form.Item> */}

          <Form.Item
            label="Nhập lại mật khẩu mới"
            name="confirmPassword"
            dependencies={["password"]}
            hasFeedback
            rules={[
              {
                required: true,
                message: "Nhập lại mật khẩu mới!",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Mật khẩu mới không trùng khớp!")
                  );
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>

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
