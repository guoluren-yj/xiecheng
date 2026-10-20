---
order: 26
title:
  en-US: export a report
  zh-CN: 导出表单
---

## zh-CN

展示一个表单的导出操作

## en-US

Simple export a report

````jsx
import { Table } from 'hzero-ui';

const columns = [{
  title: 'Name',
  dataIndex: 'name',
}, {
  title: 'Age',
  dataIndex: 'age',
}, {
  title: 'Address',
  dataIndex: 'address',
}];

const data = [];
for (let i = 0; i < 46; i++) {
  data.push({
    key: i,
    name: `Edward King ${i}`,
    age: 32,
    address: `London, Park Lane no. ${i}`,
  });
}


class App extends React.Component {
  // eslint-disable-next-line no-unused-vars
  handleExportPost = ({ dataParam, method, action }) => {
    console.log(dataParam, method, action);
    //  axios({
    //         method:method,
    //         url:action,
    //         cache:false,
    //         params:dataParam,
    //         headers:'xxx',
    //       }).then(res => {
    //      const aLink = document.createElement("a");
    //        const blob = new Blob([res.data], {type: "application/vnd.ms-excel"})
    //        aLink.href = URL.createObjectURL(blob)
    //        aLink.download = filename
    //        aLink.click()
    //        document.body.appendChild(aLink)
    //  }).catch(err => {
    //      console.log(err);
    //  })
  }

  render() {
    return (
      <div>
        <Table exported={{ action: 'http://gitee.com/xurime/excelize/raw/master/test/SharedStrings.xlsx', children: 'excel export' }} columns={columns} dataSource={data} />
      </div>
    );
  }
}

ReactDOM.render(<App />, mountNode);

````
