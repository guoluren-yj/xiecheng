---
order: 1
title:
  zh-CN: 全局化配置
  en-US: ConfigProvider
---

## zh-CN

用 `ConfigProvider` 包裹你的应用，可以配置你需要的一些全局配置。

## en-US

Wrap your app with `ConfigProvider`, and apply the contain app.

````jsx
import { Table, ConfigProvider, Icon, Divider } from 'hzero-ui';
import zhCN from 'hzero-ui/lib/locale-provider/zh_CN';

const columns = [{
  title: 'Name',
  dataIndex: 'name',
  key: 'name',
  render: text => <a href="javascript:;">{text}</a>,
}, {
  title: 'Age',
  dataIndex: 'age',
  key: 'age',
}, {
  title: 'Address',
  dataIndex: 'address',
  key: 'address',
}, {
  title: 'Action',
  key: 'action',
  render: (text, record) => (
    <span>
      <a href="javascript:;">Action 一 {record.name}</a>
      <Divider type="vertical" />
      <a href="javascript:;">Delete</a>
      <Divider type="vertical" />
      <a href="javascript:;" className="ant-dropdown-link">
        More actions <Icon type="down" />
      </a>
    </span>
  ),
}];

const data = [{
  key: '1',
  name: 'John Brown',
  age: 32,
  address: 'New York No. 1 Lake Park',
}, {
  key: '2',
  name: 'Jim Green',
  age: 42,
  address: 'London No. 1 Lake Park',
}, {
  key: '3',
  name: 'Joe Black',
  age: 32,
  address: 'Sidney No. 1 Lake Park',
}];

const App = () => (
  <div>
    <Table columns={columns} pagination={{ showSizeChanger: true }} dataSource={data} />
  </div>
);

ReactDOM.render(
  <ConfigProvider exported={{ action: 'http://gitee.com/xurime/excelize/raw/master/test/SharedStrings.xlsx', children: '导出', style: { marginBottom: 16 } }} locale={zhCN} pagenation={{ pageSizeOptions: ['10', '20', '50', '1000'] }}>
    <App />
  </ConfigProvider>,
  mountNode);
````
