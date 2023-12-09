import React from "react";
import { Modal, Divider } from "antd";
import moment from "moment";

export default function ModalViewInfo({
  isModalUser,
  setIsModalUser,
  userInfo,
}) {
  const handleCancel = () => {
    setIsModalUser(false);
  };

  const formattedDate = userInfo?.created_at
    ? moment(userInfo?.created_at).format("DD/MM/YYYY HH:mm")
    : "";

  return (
    <div>
      <Modal
        footer={false}
        title="Thông tin cá nhân"
        open={isModalUser}
        onCancel={handleCancel}
      >
        <Divider />
        <div className="modal-info">
          <span className="w-[40%]">Name:</span>
          <span>{userInfo?.name}</span>
        </div>
        <div className="modal-info">
          <span className="w-[40%]">Email:</span>
          <span>{userInfo?.email}</span>
        </div>
        <div className="modal-info">
          <span className="w-[40%]">Role:</span>
          <span>{userInfo?.roleId.name}</span>
        </div>
        <div className="modal-info">
          <span className="w-[40%]">Trạng thái:</span>
          <div className="btn-active">{userInfo?.status}</div>
        </div>
        <div className="modal-info">
          <span className="w-[40%]">Ngày tạo:</span>
          <span>{formattedDate}</span>
        </div>
      </Modal>
    </div>
  );
}
