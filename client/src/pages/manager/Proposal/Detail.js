import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { getByIdProposal } from "../../../services/api";
import { Tag, Form, Button, message } from "antd";
import moment from "moment";
import { approve, reject, comment } from "../../../services/api";
import { BiPrinter } from "react-icons/bi";
import ReactToPrint from "react-to-print";
import "./style.css";

function Detail() {
  const { id } = useParams();
  const [proposal, setProposal] = useState();
  const [commentDataa, setCommentData] = useState("");
  const dataStorage = JSON.parse(localStorage.getItem("data"));
  let componentRef = useRef();

  useEffect(() => {
    fetchDataDetails();
  }, []);

  const fetchDataDetails = async () => {
    const res = await getByIdProposal(id);
    setProposal(res);
  };

  const formatDate = (date) => moment(date).format("DD/MM/YYYY HH:mm");

  const handleComment = async () => {
    try {
      const resData = await comment(proposal._id, {
        commentContent: commentDataa,
      });

      if (resData.status === 1) {
        message.success(resData.message);
        fetchDataDetails();
        setCommentData("");
      } else {
        message.error(resData.message);
      }
    } catch (error) {
      message.error("Đã xảy ra lỗi vui lòng thử lại sau !");
    }
  };

  const handleApproval = async () => {
    try {
      const resData = await approve(proposal._id);

      if (resData.status === 1) {
        message.success(resData.message);
        fetchDataDetails();
        setCommentData("");
      } else {
        message.error(resData.message);
      }
    } catch (error) {
      message.error("Đã xảy ra lỗi vui lòng thử lại sau !");
    }
  };
  const handleReject = async () => {
    try {
      const resData = await reject(proposal._id);

      if (resData.status === 1) {
        message.success(resData.message);
        fetchDataDetails();
        setCommentData("");
      } else {
        message.error(resData.message);
      }
    } catch (error) {
      message.error("Đã xảy ra lỗi vui lòng thử lại sau !");
    }
  };

  return (
    <div>
      <div>
        <div
          style={{
            border: "1px solid gray",
            borderRadius: "0.375rem",
            width: "50%",
            margin: "0 auto",
            padding: "10px",
          }}
        >
          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h1>Thông tin đề xuất</h1>
            <div id="print_component">
              <ReactToPrint
                trigger={() => (
                  <button
                    style={{
                      backgroundColor: "#fd9900",
                      width: 30,
                      height: 30,
                      borderRadius: 50,
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                    }}
                    className="action-button"
                  >
                    <BiPrinter style={{ fontSize: "1.125rem" }} />
                  </button>
                )}
                content={() => componentRef}
              />
              <div style={{ display: "none" }}>
                <ComponentToPrint
                  ref={(el) => (componentRef = el)}
                  info={proposal}
                />
              </div>
            </div>
          </header>
          <main className="m-4 mt-0">
            <section className="modal-info">
              <span style={{ width: "20%" }}>ID:</span>
              {proposal?.title}
            </section>

            <section className="modal-info">
              <span style={{ width: "20%" }}>Thời gian tạo:</span>
              {formatDate(proposal?.createdTime)}
            </section>
            <section className="modal-info">
              <span style={{ width: "20%" }}>Loại đề xuất:</span>
              {proposal?.category}
            </section>
            <section className="modal-info">
              <span style={{ width: "20%" }}>Nội dung trích yếu:</span>
              {proposal?.content}
            </section>
            <section className="modal-info">
              <span style={{ width: "20%" }}>Người đề xuất:</span>
              {proposal?.createdBy?.fullName}
            </section>
            <section className="modal-info">
              <span style={{ width: "20%" }}>Người duyệt:</span>
              {proposal?.status === "Approved" &&
                proposal.selectedApprovalProcess.steps.pop()?.approvers?.user
                  ?.fullName}
            </section>
            <section className="modal-info">
              <span style={{ width: "20%" }}>Trạng thái:</span>
              <Tag
                color={
                  proposal?.status === "Approved"
                    ? "green"
                    : proposal?.status === "Pending"
                    ? "orange"
                    : "red"
                }
                key={proposal?.status}
              >
                {proposal?.status === "Approved"
                  ? "Đã duyệt"
                  : proposal?.status === "Pending"
                  ? "Chờ duyệt"
                  : "Đã từ chối"}
              </Tag>
            </section>
            <section className="modal-info">
              <span style={{ width: "20%" }}>File đề xuất:</span>
              <a href={`${process.env.REACT_APP_API_URL}${proposal?.file}`}>
                {proposal?.file?.split("/")?.pop()}
              </a>
            </section>
            <section className="modal-info" style={{ alignItems: "start" }}>
              <span style={{ width: "20%", marginTop: "16px" }}>
                Quy trình phê duyệt:
              </span>
              <div>
                {proposal?.selectedApprovalProcess?.steps?.map(
                  (item, index) => {
                    return (
                      <div key={index}>
                        <p>{item.stepName}</p>
                        <p>
                          Trạng thái:&nbsp;
                          <Tag
                            color={
                              item?.approvers?.status === "Approved"
                                ? "green"
                                : item?.approvers?.status === "Pending"
                                ? "orange"
                                : "red"
                            }
                            key={item?.approvers?.status}
                          >
                            {item?.approvers?.status === "Approved"
                              ? "Đã duyệt"
                              : item?.approvers?.status === "Pending"
                              ? "Chờ duyệt"
                              : "Đã từ chối"}
                          </Tag>
                        </p>
                        <p>
                          Người phê duyệt:&nbsp;
                          {item?.approvers?.user.fullName}
                        </p>
                      </div>
                    );
                  }
                )}
              </div>
            </section>

            <section className="modal-info" style={{ alignItems: "start" }}>
              <span style={{ width: "20%", marginTop: "16px" }}>
                Bình luận:
              </span>
              <div>
                {proposal?.comments?.map((item, index) => {
                  return (
                    <div key={index}>
                      {item?.user?.fullName} : {item?.content}
                    </div>
                  );
                })}
              </div>
            </section>
          </main>
        </div>
        {proposal?.status !== "Rejected" &&
          (() => {
            for (
              let i = 0;
              i < proposal?.selectedApprovalProcess?.steps?.length;
              i++
            ) {
              const step = proposal?.selectedApprovalProcess?.steps[i];
              if (step.approvers.status === "Pending") {
                if (step.approvers.user._id === dataStorage?._id) {
                  return (
                    <div key={i}>
                      {
                        <div
                          style={{
                            marginTop: "30px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            width: "50%",
                            margin: "50px auto",
                          }}
                        >
                          <Form
                            name="basic"
                            style={{
                              width: "100%",
                            }}
                            onFinish={handleComment}
                            autoComplete="off"
                          >
                            {proposal?.comments?.some(
                              (value) => value?.user?._id === dataStorage?._id
                            ) ? null : (
                              <>
                                <div className="ant-col ant-form-item-label">
                                  <label
                                    htmlFor="content"
                                    className="ant-form-item-required"
                                    title="Post Content"
                                  >
                                    Bình luận
                                  </label>
                                </div>
                                <textarea
                                  value={commentDataa}
                                  onChange={(e) =>
                                    setCommentData(e.target.value)
                                  }
                                  className="form-control"
                                  style={{ width: "100%" }}
                                  rows="5"
                                ></textarea>
                              </>
                            )}

                            <div
                              style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: "20px",
                              }}
                            >
                              {commentDataa !== "" && (
                                <Button type="primary" htmlType="submit">
                                  Bình luận
                                </Button>
                              )}
                              <Button
                                onClick={handleApproval}
                                style={{
                                  backgroundColor: "#28a745",
                                  color: "#fff",
                                  boxShadow: "0 2px 0 rgba(5, 145, 255, 0.1)",
                                }}
                              >
                                Duyệt đề xuất
                              </Button>
                              <Button
                                type="primary"
                                danger
                                onClick={handleReject}
                              >
                                Từ chối đề xuất
                              </Button>
                            </div>
                          </Form>
                        </div>
                      }
                    </div>
                  );
                } else {
                  break;
                }
              }
            }
            return null;
          })()}
      </div>
    </div>
  );
}

export default Detail;

class ComponentToPrint extends React.Component {
  render() {
    const info = this.props.info;
    console.log(info);
    return (
      <div class="app">
        <header>
          <div class="logo">
            <img src="logo.png" alt="logo" />
          </div>
          <div class="title">
            <h1>giấy đề xuất</h1>
            <p>
              <i>Ngày 10 tháng 05 năm 2023</i>
            </p>
          </div>
        </header>
        <div class="project-name">
          <i>
            Dự án: Hạ tầng kỹ thuật khu dân cư xã Xuân Lai - Huyện Thọ Xuân -
            Tỉnh Thanh Hóa
          </i>
        </div>
        <div class="suggest">
          <div class="suggest-name">
            <h3>1. Người đề xuất:</h3>
            <span>Đỗ Tiến Trường</span>
            <span class="under-dot-first-child">
              ..........................................................................
            </span>
          </div>
          <div class="suggest-name">
            <h3>Chức vụ:</h3>
            <span>Đội XL số 01</span>
            <span class="under-dot">
              .....................................................
            </span>
          </div>
        </div>
        <div class="suggest-content">
          <div class="suggest-content-name">
            <h3>2. Nội dung đề xuất:</h3>
            <span>Chi phí chung dự án</span>
            <span class="suggest-content-under-dot">
              .........................................................................................................................................................
            </span>
          </div>
        </div>
        <table border="1">
          <thead>
            <th>stt</th>
            <th>nội dung</th>
            <th>đv</th>
            <th>k. lượng</th>
            <th>đ. giá</th>
            <th>t. tiền</th>
            <th>ghi chú</th>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Tạm ứng chi phí chung MB Xuân Lai</td>
              <td></td>
              <td></td>
              <td></td>
              <td>20000000</td>
              <td></td>
            </tr>
            <tr>
              <td>2</td>
              <td>Tạm ứng chi phí chung MB Xuân Lai</td>
              <td></td>
              <td></td>
              <td></td>
              <td>20000000</td>
              <td></td>
            </tr>
            <tr>
              <td>3</td>
              <td>Tạm ứng chi phí chung MB Xuân Lai</td>
              <td></td>
              <td></td>
              <td></td>
              <td>20000000</td>
              <td></td>
              <tr>
                <td>1</td>
                <td>Tạm ứng chi phí chung MB Xuân Lai</td>
                <td></td>
                <td></td>
                <td></td>
                <td>20000000</td>
                <td></td>
              </tr>
              <tr>
                <td>2</td>
                <td>Tạm ứng chi phí chung MB Xuân Lai</td>
                <td></td>
                <td></td>
                <td></td>
                <td>20000000</td>
                <td></td>
              </tr>
              <tr>
                <td>3</td>
                <td>Tạm ứng chi phí chung MB Xuân Lai</td>
                <td></td>
                <td></td>
                <td></td>
                <td>20000000</td>
                <td></td>
              </tr>
              <tr>
                <td>1</td>
                <td>Tạm ứng chi phí chung MB Xuân Lai</td>
                <td></td>
                <td></td>
                <td></td>
                <td>20000000</td>
                <td></td>
              </tr>
              <tr>
                <td>2</td>
                <td>Tạm ứng chi phí chung MB Xuân Lai</td>
                <td></td>
                <td></td>
                <td></td>
                <td>20000000</td>
                <td></td>
              </tr>
              <tr>
                <td>3</td>
                <td>Tạm ứng chi phí chung MB Xuân Lai</td>
                <td></td>
                <td></td>
                <td></td>
                <td>20000000</td>
                <td></td>
              </tr>
              <tr>
                <td>1</td>
                <td>Tạm ứng chi phí chung MB Xuân Lai</td>
                <td></td>
                <td></td>
                <td></td>
                <td>20000000</td>
                <td></td>
              </tr>
              <tr>
                <td>2</td>
                <td>Tạm ứng chi phí chung MB Xuân Lai</td>
                <td></td>
                <td></td>
                <td></td>
                <td>20000000</td>
                <td></td>
              </tr>
              <tr>
                <td>3</td>
                <td>Tạm ứng chi phí chung MB Xuân Lai</td>
                <td></td>
                <td></td>
                <td></td>
                <td>20000000</td>
                <td></td>
              </tr>
            </tr>
          </tbody>
          <thead>
            <th></th>
            <th>cộng:</th>
            <th></th>
            <th></th>
            <th></th>
            <th>60000000</th>
            <th></th>
          </thead>
        </table>
        <div class="proposer">
          <div class="proposer-title">
            <span>Người đề xuất Ký:</span>
          </div>
          <div class="full-name">
            <span> Họ và tên: </span>
          </div>
        </div>
        <div class="opinion-proposer">
          <h4 class="">3. Ý kiến đề nghị của người phụ trách</h4>
          <span>
            <i>(Người phụ trách là CHT hoặc TP Đồng ý hay không đồng ý).</i>
          </span>
        </div>
        <div class="opinion-proposer-content">
          <span>
            ...............................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................
          </span>
          <span></span>
          <div class="proposer">
            <p class="proposer-title">Ký</p>
            <p class="proposer-title">Họ và tên:</p>
          </div>
        </div>
        <div class="opinion-proposer">
          <h4 class="">4. Ý kiến đề nghị của kế toán</h4>
          <span>
            <i>
              {" "}
              ( Yêu cầu về hóa đơn, chứng từ, báo giá, HĐ ghi cho đvị nào).
            </i>
          </span>
        </div>
        <div class="opinion-proposer-content">
          <span>
            ...............................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................
          </span>
          <span></span>
          <div class="proposer">
            <p class="proposer-title">Ký</p>
            <p class="proposer-title">Họ và tên:</p>
          </div>
        </div>
        <div class="done">
          <div>
            <div>
              <h3>giám đốc duyệt</h3>
              <div class="signature">
                <img src="signature.png" alt="signature" />
              </div>
              <div class="signature-footer">
                <p>Nguyễn Văn A</p>
                <p>Ký ngày: 11/09/2023</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
