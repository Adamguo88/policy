import { Col, Row, Table } from "antd";
import { useEffect, useState } from "react";
import { 匯率, apiData } from "./utils/data";
import MyUpload from "./MyUpload";

export default function App() {
  const [uploadData, setUploadData] = useState([]);
  const [api, setApi] = useState([]);
  const columns = [
    { dataIndex: "rocYear", title: "民國年", key: "rocYear", align: "center" },
    { dataIndex: "expend1", title: "保障型", key: "expend1", align: "center", render: (v) => Number.parseInt(v).toLocaleString() },
    { dataIndex: "expend2", title: "儲蓄型", key: "expend2", align: "center", render: (v) => Number.parseInt(v).toLocaleString() },
    { dataIndex: "expend3", title: "變額(萬能)壽險", key: "expend3", align: "center", render: (v) => Number.parseInt(v).toLocaleString() },
    { dataIndex: "expend4", title: "變額年金", key: "expend4", align: "center", render: (v) => Number.parseInt(v).toLocaleString() },
    { dataIndex: "selfIncome", title: "本人收入", key: "selfIncome", align: "center", render: (v) => Number.parseInt(v).toLocaleString() },
    {
      dataIndex: "spouseIncome",
      title: "配偶收入",
      key: "spouseIncome",
      align: "center",
      render: (v) => Number.parseInt(v).toLocaleString(),
    },
  ];
  const callSuccess = (v) => {
    console.log(v);
    setUploadData(v);
  };
  useEffect(() => {
    const obj = {};
    Array.from({ length: 100 }).forEach((_, index) => {
      obj[index + 115] = {
        rocYear: index + 115,
        expend1: 0,
        expend2: 0,
        expend3: 0,
        expend4: 0,
        selfIncome: 0,
        spouseIncome: 0,
      };
    });
    if (uploadData.length >= 1) {
      // 篩選保費支出
      const addExpend = (list) => {
        const premium = list.filter((item) => item.currentType);
        premium.forEach((item) => {
          if (item.currentType !== "TWD") {
            const rate = 匯率?.[item.currentType] || 1;
            insertExpend(item.values, Number.parseFloat(rate));
          } else {
            insertExpend(item.values, 1);
          }
        });
      };
      // 塞入保單支出緩存
      const insertExpend = (list, rate) => {
        list.forEach((item) => {
          const yearData = obj[item.rocYear];
          if (yearData) {
            const newValue = Math.round(Number.parseInt(item.value) * Number.parseFloat(rate));
            const total = Number.parseInt(yearData.expend1) + newValue;
            obj[item.rocYear] = { ...yearData, expend1: total };
          }
        });
      };

      // 篩選保單收入
      const addIncome = (list) => {
        const repay = list.filter((item) => item.currentType && (item.customerName.startsWith("本") || item.customerName.startsWith("配")));
        repay.forEach((item) => {
          const insertName = item.customerName.startsWith("本") ? "selfIncome" : "spouseIncome";
          if (item.currentType !== "TWD") {
            const rate = 匯率?.[item.currentType] || 1;
            insertIncome(item.values, Number.parseFloat(rate), insertName);
          } else {
            insertIncome(item.values, 1, insertName);
          }
        });
      };
      // 塞入保單收入欄位
      const insertIncome = (list, rate, name) => {
        list.forEach((item) => {
          const yearData = obj[item.rocYear];
          if (yearData) {
            const newValue = Math.round(Number.parseInt(item.value) * Number.parseFloat(rate));
            const total = Number.parseInt(yearData?.[name]) + newValue;
            obj[item.rocYear] = { ...yearData, [name]: total };
          }
        });
      };
      uploadData?.forEach((item) => {
        addExpend(item.wholePremium);
        addIncome(item.wholeRepay);
      });
      console.log(Object.values(obj));
      setApi(Object.values(obj));
    }
  }, [uploadData]);
  return (
    <div style={{ width: "100%", maxWidth: "1400px", margin: "0 auto" }}>
      <Row>
        <Col span={24}>
          <MyUpload onSuccess={callSuccess} />
        </Col>
        <Col span={24}>
          <Table
            columns={columns}
            rowKey={(item) => item.rocYear}
            dataSource={api}
            bordered={true}
            pagination={{
              hideOnSinglePage: true,
              placement: ["none", "bottomCenter"],
              pageSize: 100,
              // current: isMainCurrentPage,
              // onChange: handleFunction.handleMainTableChange,
            }}
            scroll={{ x: "max-content" }}
          />
        </Col>
      </Row>
    </div>
  );
}
