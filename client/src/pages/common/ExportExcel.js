import ExcelJS from "exceljs";
//export Excel
export const handleExport = async (listDatas, headerRowFile, fileName) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sheet 1");
  // header workshit
  worksheet.addRow(headerRowFile);
  // add data to worksheet
  listDatas?.forEach((item, index) => {
    const rowData = headerRowFile.map((header) => {
      switch (header) {
        case "STT":
          return index + 1;
        case "Tên":
        case "Người tạo":
          return item.name;
        case "Email":
          return item.email;
        case "Leader":
          return item?.leaderId;
        case "Phân quyền":
          return item?.roleId;
        case "Telegram":
          return item.telegramId;
        case "Ngày tạo":
          return item.created_at;
        case "Cập nhật":
          return item.updated_at;
        case "Trạng thái":
          return item.status;
        case "URL":
          return item.linkUrl;
        default:
          return ""; // case undefined
      }
    });

    worksheet.addRow(rowData);
  });

  // create a file Excel
  const buffer = await workbook.xlsx.writeBuffer();

  // Download File Excel
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileName}.xlsx`;
  a.click();
};
