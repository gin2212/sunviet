import React, { useState, useEffect } from "react";
import {
  Space,
  Select,
  Popconfirm,
  Button,
  Input,
  message,
  Form,
  Tag,
  Flex,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import DataTable from "../../common/DataTable";
import moment from "moment";
import ExcelJS from "exceljs";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getWebsite,
  getSuggest,
  createSuggest,
  updateSuggest,
  deleteSuggese,
} from "../../../services/api";
import ModalFunction from "./ModalFunction";

const { Option } = Select;
let searchDebounceTimeout = null;

export default function ListSuggest() {
  document.title = "Danh sách đề xuất";
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const websiteId = searchParams.get("websiteId");
  const [domain, setDomain] = useState(websiteId || null);
  const [listWebsite, setListWebsite] = useState([]);
  const [isModalFunction, setIsModalFunction] = useState(false);
  const [editData, setEditData] = useState();
  const [titleModal, setTitleModal] = useState("Thêm Đề Xuất");
  const [listSuggest, setListSuggest] = useState([]);
  const [search, setSearch] = useState("");
  //pagination
  const [totalPage, setTotalPage] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(true);

  //gọi hàm call api domain
  useEffect(() => {
    fetchDataWebsite();
  }, []);

  //gọi hàm call api lấy ra danh sách suggest đựa vào domain
  useEffect(() => {
    if (domain) {
      fetchData(domain, "");
    }
  }, [domain]);

  //xử lý khi chuyển trang
  const onPageChange = (page, limit) => {
    setPage(page);
    setLimit(limit);

    onPageChangeAtSearch(page, limit);
  };

  //xử lý chuyển trang trong lúc search
  const onPageChangeAtSearch = async (page, limit) => {
    const params = {
      page: page,
      limit: limit,
      search: search,
    };

    const dataRes = await getAll(domain, params);
    setListSuggest(dataRes || []);
  };

  //hàm gọi api lấy ra danh sách suggest
  const fetchData = async (id, data) => {
    const resListSuggest = await getAll(id, data);

    setListSuggest(resListSuggest || []);
  };

  //hàm gọi api lấy ra danh sách domain để gắn vào select

  const fetchDataWebsite = async () => {
    const res = await getWebsite({ limit: 100000 });
    if (res?.data?.items?.length > 0) {
      const formatData = res?.data?.items.map((item) => item?.website || item);
      setListWebsite(formatData);

      if (!domain) {
        setDomain(formatData[0]?._id);
      }
    } else {
      setLoading(false);
    }
  };

  //gọi data ra table và xử lý converData
  const getAll = async (id, _prams) => {
    setLoading(true);
    try {
      const params = _prams
        ? _prams
        : {
            page: 1,
            limit: 10,
            search: "",
          };

      const res = await getSuggest(id, params);
      setTotalPage(res.data.pagination.total);
      const listWebsite = res?.data?.items;
      const data = convertDataTable(listWebsite);
      setLoading(false);
      return res?.data ? data : [];
    } catch (error) {
      message.error("Lỗi khi lấy danh sách domain:");
    } finally {
      setLoading(false);
    }
  };

  //hàm này xử lý khi bấm vào nút edit
  const onEdit = async (id) => {
    const dataEdit = listSuggest.filter((item) => item.key === id);
    setEditData(dataEdit[0]);
    setIsModalFunction(true);
    setTitleModal("Cập nhật Đề Xuất");
  };

  //Hàm xử lý khi bấm vào nút delete
  const onDelete = async (id) => {
    try {
      const resWebsite = await deleteSuggese(id);

      if (resWebsite?.statusCode === 200) {
        message.success("Xóa đề xuất thành công!");

        const updatedData = await getAll(domain, "");
        setListSuggest(updatedData);
      } else {
        message.error("Xóa đề Xuất thất bại!");
      }
    } catch (error) {
      console.log(error);
      message.error("Đã xảy ra lỗi, vui lòng thử lại!");
    }
  };

  //Conver data
  const convertDataTable = (dataArray) => {
    let data =
      dataArray?.length > 0 &&
      dataArray.map((item) => {
        return {
          key: item?._id,
          name: item?.name,
          linkSuggest: item?.linkSuggest,
          telegramId: item?.telegramId,
          createName: item?.userId.name,
          domain: item?.websiteId.domain,
          created_at: moment(item?.created_at).format("DD/MM/YYYY HH:mm"),
          status: item?.status,
          guaranteed: item?.guaranteed,
        };
      });
    return dataArray ? data : [];
  };

  //Hàm này để xem thông tin chi tiết (đi tới detail)
  const showInfo = (id) => {
    navigate(`/detail/${id}`);
  };

  const onSearch = (value) => {
    setSearch(value);
    // Xóa timeout trước đó để đảm bảo chỉ thực hiện tìm kiếm sau cùng
    if (searchDebounceTimeout) clearTimeout(searchDebounceTimeout);

    // Thiết lập một timeout mới
    searchDebounceTimeout = setTimeout(async () => {
      const params = {
        page: 1,
        limit: 10,
        search: value,
      };
      // Gọi API với giá trị tìm kiếm sau khi chờ đợi 300ms
      const dataRes = await getAll(domain, params);
      setListSuggest(dataRes);
    }, 300); // Đợi 300ms sau khi người dùng ngừng gõ để thực hiện tìm kiếm
  };

  const handleRefresh = async () => {
    fetchData(domain, "");
    setSearch("");
  };

  //colunm của table
  const columns = [
    {
      title: "Tên Đề Xuất",
      dataIndex: "name",
    },
    {
      title: "Người tạo",
      dataIndex: "createName",
      render: (_, { createName }) => {
        return createName ? <Tag color="geekblue"> {createName}</Tag> : "";
      },
    },
    {
      title: "Link đề xuất",
      dataIndex: "linkSuggest",
      render: (_, { linkSuggest }) => {
        return (
          <a className="long-text" href={linkSuggest} target="_blank">
            {linkSuggest}
          </a>
        );
      },
    },
    {
      title: "Domain",
      dataIndex: "domain",
      render: (_, { domain }) => {
        return (
          <a className="text-[#4096ff] " href={domain} target="_blank">
            {domain}
          </a>
        );
      },
    },
    {
      title: "Thời gian bảo hành",
      dataIndex: "guaranteed",
      render: (_, { guaranteed }) => {
        return moment(guaranteed).format("DD/MM/YYYY HH:mm");
      },
    },

    {
      title: "Thời gian tạo",
      dataIndex: "created_at",
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Flex className="gap-2 items-center">
          <button
            onClick={() => showInfo(record.key)}
            className="bg-blue-600 action-button"
          >
            <EyeOutlined />
          </button>
          <button
            onClick={() => onEdit(record.key)}
            className="bg-[#fd9900] action-button"
          >
            <EditOutlined />
          </button>

          <Popconfirm
            cancelButtonProps={{ className: "bg-red-500 text-white btn-del" }}
            okButtonProps={{
              className: "bg-blue-600 text-white",
            }}
            title="Xóa Đề Xuất"
            description="Bạn muốn xóa đề xuất này?"
            onConfirm={() => onDelete(record.key)}
            okText="Yes"
            cancelText="No"
            okType=""
          >
            <button className="bg-red-600 action-button">
              <DeleteOutlined />
            </button>
          </Popconfirm>
          {record.telegramId && (
            <a href={record.telegramId} target="_blank">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                width="36"
                height="36"
                viewBox="0 0 48 48"
              >
                <path
                  fill="#29b6f6"
                  d="M24 4A20 20 0 1 0 24 44A20 20 0 1 0 24 4Z"
                ></path>
                <path
                  fill="#fff"
                  d="M33.95,15l-3.746,19.126c0,0-0.161,0.874-1.245,0.874c-0.576,0-0.873-0.274-0.873-0.274l-8.114-6.733 l-3.97-2.001l-5.095-1.355c0,0-0.907-0.262-0.907-1.012c0-0.625,0.933-0.923,0.933-0.923l21.316-8.468 c-0.001-0.001,0.651-0.235,1.126-0.234C33.667,14,34,14.125,34,14.5C34,14.75,33.95,15,33.95,15z"
                ></path>
                <path
                  fill="#b0bec5"
                  d="M23,30.505l-3.426,3.374c0,0-0.149,0.115-0.348,0.12c-0.069,0.002-0.143-0.009-0.219-0.043 l0.964-5.965L23,30.505z"
                ></path>
                <path
                  fill="#cfd8dc"
                  d="M29.897,18.196c-0.169-0.22-0.481-0.26-0.701-0.093L16,26c0,0,2.106,5.892,2.427,6.912 c0.322,1.021,0.58,1.045,0.58,1.045l0.964-5.965l9.832-9.096C30.023,18.729,30.064,18.416,29.897,18.196z"
                ></path>
              </svg>
            </a>
          )}
        </Flex>
      ),
    },
  ];

  //hàm xử lý khi thay đổi domain trên select sẽ call api lại lại danh sách suggest
  const handleChangeWebsite = (id) => {
    setDomain(id);
  };

  //Xử lý cho thêm và sửa
  const onFinish = async (data) => {
    data.guaranteed = data.guaranteed.format("YYYY-MM-DD HH:mm:ss");
    data.linkSuggest = data.linkSuggest.startsWith("http")
      ? data.linkSuggest
      : "https://" + data.linkSuggest;

    if (data?.telegramId) {
      if (data.telegramId.startsWith("https://t.me/")) {
        data.telegramId = data.telegramId;
      } else {
        data.telegramId = "https://t.me/" + data.telegramId;
      }
    }
    if (editData) {
      data.id = editData.key;
      try {
        const resUpdate = await updateSuggest(data);
        if (resUpdate.statusCode === 200) {
          message.success("Cập nhật đề xuất thành công!");
          fetchData(domain, "");
        } else {
          message.error("Cập nhật đề xuất thất bại!");
        }
      } catch (error) {
        console.log(error);
        message.error("Đã xảy ra lỗi, vui lòng thử lại!");
      }
    } else {
      data.websiteId = domain;

      try {
        const resCreate = await createSuggest(data);
        if (resCreate.statusCode === 200) {
          message.success("Thêm đề xuất thành công!");
          fetchData(domain, "");
        } else {
          message.error("Thêm đề xuất thất bại!");
        }
      } catch (error) {
        console.log(error);
        message.error("Đã xảy ra lỗi, vui lòng thử lại!");
      }
    }

    setIsModalFunction(false);
    form.resetFields();
    setSearch("");
  };

  //Hàm này khi bấm vào nút thêm sẽ hiển thị modal
  const handleAdd = () => {
    setIsModalFunction(true);
    setEditData();
    form.resetFields();
    setTitleModal("Thêm Đề Xuất");
  };

  //Hàm xử lý export excel
  const handleExport = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet 1");

    // Thêm dữ liệu vào worksheet
    worksheet.addRow([
      "Tên",
      "Người tạo",
      "Link đề Xuất",
      "Domain",
      "Thời gian bảo hành",
      "Thời gian tạo",
    ]);
    listSuggest?.forEach((item) =>
      worksheet.addRow([
        item.name,
        item.createName,
        item.linkSuggest,
        item.domain,
        item.guaranteed,
        item.created_at,
      ])
    );
    // Tạo một tệp Excel
    const buffer = await workbook.xlsx.writeBuffer();
    // Tải tệp Excel
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "suggest.xlsx";
    a.click();
  };
  return (
    <React.Fragment>
      <div>
        <div className="flex gap-2 mt-5 items-start">
          <Select
            placeholder="Chọn domain"
            showSearch
            style={{ width: 300, marginTop: "-20px", marginBottom: "20px" }}
            onChange={handleChangeWebsite}
            value={domain}
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {listWebsite?.length > 0 &&
              listWebsite?.map((item) => {
                return (
                  <Option key={item._id} value={item._id}>
                    {item.domain}
                  </Option>
                );
              })}
          </Select>
          <Space.Compact style={{ width: 300, marginTop: "-20px" }}>
            <Input
              addonBefore={<SearchOutlined />}
              placeholder="Nhập tên đề xuất"
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              allowClear
            />
          </Space.Compact>
        </div>
        <div className="flex gap-2 mt-5 ">
          {domain && (
            <Button
              type="primary"
              className="add-btn flex items-center"
              onClick={handleAdd}
            >
              Thêm Đề Xuất
            </Button>
          )}
          <Button
            onClick={handleExport}
            className="btn-excel flex items-center"
            disabled={listSuggest?.length == 0}
          >
            Xuất Excel
          </Button>
          <Button
            onClick={handleRefresh}
            type="primary"
            className="add-btn flex items-center"
            disabled={loading}
          >
            Reload
          </Button>
        </div>
        <DataTable
          listData={listSuggest}
          pageSize={limit}
          columns={columns}
          indexPage={page}
          totalPage={totalPage}
          onPageChange={onPageChange}
          loading={loading}
        />

        <ModalFunction
          isModalFunction={isModalFunction}
          setIsModalFunction={setIsModalFunction}
          dataEdit={editData}
          onFinish={onFinish}
          title={titleModal}
          form={form}
        />
      </div>
    </React.Fragment>
  );
}
