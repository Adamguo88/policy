import React from "react";
import { Upload, message, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";

export default function MyUpload({ onSuccess }) {
  const props = {
    name: "file",
    accept: ".json", // 限制只能選取 json 檔案
    maxCount: 1,
    beforeUpload: (file) => {
      // 1. 檢查檔案型別 (保險起見)
      const isJson = file.type === "application/json";
      if (!isJson) {
        message.error(`${file.name} 不是一個有效的 JSON 檔案`);
        return Upload.LIST_IGNORE;
      }

      // 2. 使用 FileReader 讀取內容
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result;
          // 3. 轉換為 JS 物件
          const jsonData = JSON.parse(content);

          message.success(`${file.name} 轉換成功！`);
          // 4. 返回資料給父組件
          onSuccess(jsonData);
        } catch (err) {
          message.error("解析 JSON 失敗，請檢查檔案格式");
          console.error("JSON Parse Error:", err);
        }
      };

      reader.readAsText(file);

      // 回傳 false 停止 antd 的預設上傳動作 (不打 API)
      return false;
    },
    onRemove: () => {
      onSuccess(null);
    },
  };

  return (
    <Upload {...props}>
      <Button icon={<UploadOutlined />}>點擊上傳 JSON 檔案</Button>
    </Upload>
  );
}
