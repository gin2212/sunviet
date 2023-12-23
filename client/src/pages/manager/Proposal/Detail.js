import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { getByIdProposal } from "../../../services/api";
import { Tag, Form, Button, message } from "antd";
import moment from "moment";
import { approve, reject, comment } from "../../../services/api";
import { BiPrinter } from "react-icons/bi";
import ReactToPrint from "react-to-print";

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
      {/* <div>
        <ComponentToPrint ref={(el) => (componentRef = el)} info={proposal} />
      </div> */}
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
              {proposal?.selectedApprovalProcess?.steps[
                proposal?.selectedApprovalProcess?.steps?.length - 1
              ] === "Approved" &&
                proposal?.selectedApprovalProcess?.steps[
                  proposal?.selectedApprovalProcess?.steps?.length - 1
                ]?.approvers?.user?.fullName}
            </section>
            <section className="modal-info">
              <span style={{ width: "20%" }}>Trạng thái:</span>
              <Tag
                color={
                  proposal?.selectedApprovalProcess?.steps[
                    proposal?.selectedApprovalProcess?.steps?.length - 1
                  ]?.approvers?.status === "Approved"
                    ? "green"
                    : proposal?.selectedApprovalProcess?.steps[
                        proposal?.selectedApprovalProcess?.steps?.length - 1
                      ]?.approvers?.status === "Pending"
                    ? "orange"
                    : "red"
                }
                key={
                  proposal?.selectedApprovalProcess?.steps[
                    proposal?.selectedApprovalProcess?.steps?.length - 1
                  ]?.approvers?.status
                }
              >
                {proposal?.selectedApprovalProcess?.steps[
                  proposal?.selectedApprovalProcess?.steps?.length - 1
                ]?.approvers?.status === "Approved"
                  ? "Đã duyệt"
                  : proposal?.selectedApprovalProcess?.steps[
                      proposal?.selectedApprovalProcess?.steps?.length - 1
                    ]?.approvers?.status === "Pending"
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
                          {item?.approvers?.user?.fullName}
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

    const isoString =
      info?.selectedApprovalProcess?.steps[
        info?.selectedApprovalProcess?.steps?.length - 1
      ]?.approvers?.user?.updatedTime;

    const createProjectDay = info?.createdTime;

    const dateObject = new Date(isoString);
    const createdTimeProject = new Date(createProjectDay);

    const dayCreated = createdTimeProject.getUTCDate();
    const monthCreated = createdTimeProject.getUTCMonth() + 1;
    const yearCreated = createdTimeProject.getUTCFullYear();

    const day = dateObject.getUTCDate();
    const month = dateObject.getUTCMonth() + 1;
    const year = dateObject.getUTCFullYear();

    let totalCost = 0;
    return (
      <div>
        <style jsx>{`
          * {
            box-sizing: border-box;
            padding: 0;
            margin: 0;
          }

          .body {
            max-width: 794px;
            max-height: 1123px;
            margin: 20px auto;
          }

          .app {
            border: 2px solid #ccc;
            padding: 10px;
          }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .header .logo {
            object-fit: contain;
            width: 70%;
          }

          .header .logo img {
            width: 95%;
          }

          header .title {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: end;
            justify-content: center;
            position: relative;
            top: 10px;
            right: 10px;
          }

          header .title h1 {
            text-transform: uppercase;
            font-size: 28px;
          }

          header .title p {
            font-size: 16px;
            line-height: 26px;
            text-align: justify;
          }

          .project-name {
            width: 100%;
            text-align: center;
            font-size: 18px;
            margin-top: 10px;
          }

          .suggest {
            display: flex;
            justify-content: space-between;
            margin-top: 10px;
          }

          .suggest-name {
            display: flex;
            position: relative;
          }

          .suggest-name:last-child {
            width: 40%;
          }

          .suggest-name h3 {
            margin-right: 50px;
            font-size: 16px;
          }

          .under-dot-first-child {
            position: absolute;
            left: 50%;
            top: 3px;
          }

          .under-dot {
            position: absolute;
            left: 30%;
            top: 3px;
          }

          .suggest-content {
            margin-top: 10px;
          }

          .suggest-content-name {
            display: flex;
            position: relative;
          }

          .suggest-content-name h3 {
            font-size: 16px;
            margin-right: 20px;
          }

          .suggest-content-under-dot {
            position: absolute;
            top: 2px;
            left: 20%;
          }

          table {
            margin-top: 10px;
            width: 100%;
            border-collapse: collapse;
          }

          thead {
            text-transform: uppercase;
          }

          th {
            padding: 5px;
          }

          tr td {
            padding: 5px;
          }

          .proposer {
            display: flex;
            justify-content: flex-end;
            margin-top: 10px;
          }

          .proposer-title,
          .full-name {
            // margin-right: 10%;
          }

          .opinion-proposer {
            display: flex;
            margin-top: 10px;
          }

          .opinion-proposer h4 {
            margin-right: 6px;
          }

          .opinion-proposer-content {
            width: 100%;
            overflow: hidden;
            position: relative;
          }

          .opinion-proposer-content span {
            word-wrap: break-word;
          }

          .opinion-proposer-content-first-child {
            position: relative;
            top: 4px;
          }

          .opinion-proposer-content-last-child {
            position: absolute;
            top: 0;
            left: 0;
          }

          .done {
            width: 100%;
            margin-top: 20px;
          }

          .done div {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: end;
            width: 100%;
            height: 100%;
          }

          .done div div {
            width: 50%;
            display: flex;
            align-items: center;
          }

          .done div div h3 {
            text-transform: uppercase;
          }

          .signature {
            display: flex;
            align-items: center;
          }

          .signature img {
            width: 100%;
            max-width: 200px;
          }

          .signature-footer {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
        `}</style>

        <div class="body">
          <div className="app">
            <header className="header">
              <div className="logo">
                <img src="/logo.png" alt="logo" />
              </div>
              <div className="title">
                <h1>giấy đề xuất</h1>
                <p>
                  <i>
                    Ngày {dayCreated} tháng {monthCreated} năm {yearCreated}
                  </i>
                </p>
              </div>
            </header>
            <div className="project-name">
              <i>Dự án: {info?.project?.projectName}</i>
            </div>
            <div className="suggest">
              <div className="suggest-name">
                <h3>1. Người đề xuất:</h3>
                <span>{info?.createdBy?.fullName}</span>
                <span className="under-dot-first-child">
                  ..........................................................................
                </span>
              </div>
              <div className="suggest-name">
                <h3>Chức vụ:</h3>
                <span>{info?.createdBy?.role?.roleName}</span>
                <span className="under-dot">
                  .....................................................
                </span>
              </div>
            </div>
            <div className="suggest-content">
              <div className="suggest-content-name">
                <h3>2. Nội dung đề xuất:</h3>
                <span>{info?.content}</span>
                <span className="suggest-content-under-dot">
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
                {info?.proposalContent?.map((item, index) => (
                  <>
                    {
                      <div style={{ display: "none" }}>
                        {(totalCost += item.totalCost)}
                      </div>
                    }
                    <tr>
                      <td>{index + 1}</td>
                      <td>{item.content}</td>
                      <td>{item.agency}</td>
                      <td>{item.mass}</td>
                      <td>{item.unitPrice}</td>
                      <td>{item.totalCost}</td>
                      <td>{item.description}</td>
                    </tr>
                  </>
                ))}
              </tbody>
              <thead>
                <th></th>
                <th>cộng:</th>
                <th></th>
                <th></th>
                <th></th>
                <th>{totalCost}</th>
                <th></th>
              </thead>
            </table>
            <div className="proposer">
              <div
                className="proposer-title"
                style={{ display: "flex", alignItems: "center" }}
              >
                <span>Người đề xuất Ký:</span>
                <img
                  src={info?.signatureImage}
                  alt="Chữ ký"
                  style={{ width: "150px" }}
                />
                <span style={{ marginRight: "10px" }}> Họ và tên: </span>
                <span> {info?.createdBy?.fullName} </span>
              </div>
            </div>
            <div className="opinion-proposer">
              <h4 className="">3. Ý kiến đề nghị của người phụ trách</h4>
              <span>
                <i>(Người phụ trách là CHT hoặc TP Đồng ý hay không đồng ý).</i>
              </span>
            </div>
            <div className="opinion-proposer-content">
              <span className="opinion-proposer-content-first-child">
                ...............................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................
              </span>
              <span className="opinion-proposer-content-last-child">
                {info?.comments[info?.comments?.length - 4]?.content}
              </span>
              <div
                className="proposer"
                style={{ display: "flex", alignItems: "center" }}
              >
                <p
                  className="proposer-title"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginRight: "20px",
                  }}
                >
                  <span>Ký</span>
                  <img
                    style={{ width: "150px" }}
                    src={
                      info?.comments[info?.comments?.length - 2]?.user
                        ?.signatureImage
                    }
                    alt=""
                  />
                </p>
                <p className="proposer-title">
                  <span style={{ marginRight: "10px" }}>Họ và tên:</span>
                  <span>
                    {info?.comments[info?.comments?.length - 2]?.user?.fullName}
                  </span>
                </p>
              </div>
            </div>
            <div className="opinion-proposer">
              <h4 className="">4. Ý kiến đề nghị của kế toán</h4>
              <span>
                <i>
                  ( Yêu cầu về hóa đơn, chứng từ, báo giá, HĐ ghi cho đvị nào).
                </i>
              </span>
            </div>
            <div className="opinion-proposer-content">
              <span className="opinion-proposer-content-first-child">
                ...............................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................
              </span>
              <span className="opinion-proposer-content-last-child">
                {info?.comments[info?.comments?.length - 3]?.content}
              </span>
              <div
                className="proposer"
                style={{ display: "flex", alignItems: "center" }}
              >
                <p
                  className="proposer-title"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginRight: "20px",
                  }}
                >
                  <span>Ký</span>
                  <img
                    style={{ width: "150px" }}
                    src={
                      info?.comments[info?.comments?.length - 1]?.user
                        ?.signatureImage
                    }
                    alt=""
                  />
                </p>
                <p className="proposer-title">
                  <span style={{ marginRight: "10px" }}>Họ và tên:</span>
                  <span>
                    {info?.comments[info?.comments?.length - 1]?.user?.fullName}
                  </span>
                </p>
              </div>
            </div>

            <div className="opinion-proposer">
              <h4 className="">5. Ý kiến của Ban kiểm soát - Phó Giám Đốc</h4>
              <span>
                <i>
                  ( Yêu cầu về hóa đơn, chứng từ, báo giá, HĐ ghi cho đvị nào).
                </i>
              </span>
            </div>
            <div className="opinion-proposer-content">
              <span className="opinion-proposer-content-first-child">
                ...............................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................
              </span>
              <span className="opinion-proposer-content-last-child">
                {info?.comments[info?.comments?.length - 2]?.content}
              </span>
              <div
                className="proposer"
                style={{ display: "flex", alignItems: "center" }}
              >
                <p
                  className="proposer-title"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginRight: "20px",
                  }}
                >
                  <span>Ký</span>
                  <img
                    style={{ width: "150px" }}
                    src={
                      info?.comments[info?.comments?.length - 1]?.user
                        ?.signatureImage
                    }
                    alt=""
                  />
                </p>
                <p className="proposer-title">
                  <span style={{ marginRight: "10px" }}>Họ và tên:</span>
                  <span>
                    {info?.comments[info?.comments?.length - 1]?.user?.fullName}
                  </span>
                </p>
              </div>
            </div>

            <div className="opinion-proposer">
              <h4 className="">6. Ý kiến của Giám Đốc</h4>
            </div>
            <div className="opinion-proposer-content">
              <span className="opinion-proposer-content-first-child">
                ...............................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................
              </span>
              <span className="opinion-proposer-content-last-child">
                {info?.comments[info?.comments?.length - 1]?.content}
              </span>
              <div
                className="proposer"
                style={{ display: "flex", alignItems: "center" }}
              >
                <p
                  className="proposer-title"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginRight: "20px",
                  }}
                >
                  <span>Ký</span>
                  <img
                    style={{ width: "150px" }}
                    src={
                      info?.comments[info?.comments?.length - 1]?.user
                        ?.signatureImage
                    }
                    alt=""
                  />
                </p>
                <p className="proposer-title">
                  <span style={{ marginRight: "10px" }}>Họ và tên:</span>
                  <span>
                    {info?.comments[info?.comments?.length - 1]?.user?.fullName}
                  </span>
                </p>
              </div>
            </div>
            <div className="done">
              <div>
                <div>
                  <h3>giám đốc duyệt</h3>

                  <div className="signature">
                    <img
                      src={
                        info?.selectedApprovalProcess?.steps[
                          info?.selectedApprovalProcess?.steps?.length - 1
                        ]?.approvers?.user?.stampImage
                      }
                      alt="stampImage"
                    />

                    <img
                      src={
                        info?.selectedApprovalProcess?.steps[
                          info?.selectedApprovalProcess?.steps?.length - 1
                        ]?.approvers?.user?.signatureImage
                      }
                      alt="signature"
                    />
                  </div>
                  <div className="signature-footer">
                    <p>
                      {
                        info?.selectedApprovalProcess?.steps[
                          info?.selectedApprovalProcess?.steps?.length - 1
                        ]?.approvers?.user?.fullName
                      }
                    </p>

                    <p>
                      Ký ngày: {day}/{month}/{year}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
