---
order: 29
title:
  en-US: Resiable
  zh-CN: 列伸缩
---

## zh-CN

resizable 示例

## en-US

resizable example

````jsx
import { Table, Icon, Divider } from 'hzero-ui';

const genIndex = [1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1];

const columns = [{
  title: 'Name',
  dataIndex: 'name',
  key: 'name',
  fixed: 'left',
  width: 100,
  render: text => <a href="javascript:;">{text}</a>,
}, {
  title: 'Age',
  dataIndex: 'age',
  key: 'age',
  fixed: 'left',
  width: 100,
},
{
  title: 'Address',
  dataIndex: 'address',
  key: 'address',
  fixed: 'left',
  width: 100,
},
...(genIndex).map((v, index) => {
  return {
    key: `g-${index}`,
    dataIndex: `g-${index}`,
    title: `g-${index}`,
    width: v * 100,
  };
}),
{
  title: 'Action',
  key: 'action',
  width: 100,
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
},
...(genIndex).map((v, index) => {
  return {
    key: `g-${index}`,
    name: `g-${index}`,
    age: v * 10,
    address: `g-${index}`,
  };
}),
].map((r) => {
  const oD = genIndex.reduce((acc, cur, idx) => {
    return { ...acc, [`g-${idx}`]: `g-${idx}-value-${cur}` };
  }, {});
  return {
    ...r,
    ...oD,
  };
});

ReactDOM.render(<Table bordered columns={columns} scroll={{ x: 5300 }} dataSource={data} />, mountNode);
````
