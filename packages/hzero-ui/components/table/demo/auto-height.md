---
order: 27
title:
  en-US: AutoHeight
  zh-CN: 自适应高度
---

## zh-CN

自适应高度(需要父级元素非仅由 Table 撑开)。

autoHeight:

| 类型 | —— | 默认值 / 自定义 |
| --- | --- |  --- |
| boolean |  | false |
| boolean |  | true = { type: 'minHeight', diff: 80 } |
| object |  | { type: 'minHeight' \| 'maxHeight', diff: number(Table 自适应底部预留调整参数) } |

## en-US

````jsx
import { Table } from "hzero-ui";

const columns = [
  {
    title: "Name",
    dataIndex: "name",
  },
  {
    title: "Age",
    dataIndex: "age",
    width: 200,
  },
  {
    title: "Address",
    dataIndex: "address",
    width: 500,
  },
    {
    title: "Name",
    dataIndex: "name1",
    width: 200,
  },
  {
    title: "Age",
    dataIndex: "age1",
    width: 200,
  },
  {
    title: "Address",
    dataIndex: "address1",
    width: 200,
  }
];

const data = [];
for (let i = 0; i < 200; i++) {
  data.push({
    key: i,
    name: `Edward King ${i}`,
    age: 32,
    address: `London, Park Lane no. ${i}`,
    name1: `Edward King ${i}`,
    age1: 32,
    address1: `London, Park Lane no. ${i}`
  });
}

class App extends React.Component {
  state = {
    selectedRowKeys: [], // Check here to configure the default column
    scroll: { x: 1500 },
  };

  onSelectChange = (selectedRowKeys) => {
    console.log("selectedRowKeys changed: ", selectedRowKeys);
    this.setState({ selectedRowKeys,scroll:{x: 1500, y:200 } });
  };

  render() {
    const { selectedRowKeys } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
      hideDefaultSelections: true,
      selections: [
        {
          key: "all-data",
          text: "Select All Data",
          onSelect: () => {
            this.setState({
              selectedRowKeys: [...Array(46).keys()] // 0...45
            });
          }
        },
        {
          key: "odd",
          text: "Select Odd Row",
          onSelect: (changableRowKeys) => {
            let newSelectedRowKeys = [];
            newSelectedRowKeys = changableRowKeys.filter((key, index) => {
              if (index % 2 !== 0) {
                return false;
              }
              return true;
            });
            this.setState({ selectedRowKeys: newSelectedRowKeys });
          }
        },
        {
          key: "even",
          text: "Select Even Row",
          onSelect: (changableRowKeys) => {
            let newSelectedRowKeys = [];
            newSelectedRowKeys = changableRowKeys.filter((key, index) => {
              if (index % 2 !== 0) {
                return true;
              }
              return false;
            });
            this.setState({ selectedRowKeys: newSelectedRowKeys });
          }
        }
      ],
      onSelection: this.onSelection
    };
    const pagination = {
      showSizeChanger: true
    };
    return (
      <Table
        rowSelection={rowSelection}
        bordered={true}
        // autoHeight={{ type: "minHeight" }}
        pagination={pagination}
        columns={columns}
        dataSource={data}
        scroll={this.state.scroll}
        autoHeight={{ type: "maxHeight" }}
      />
    );
  }
}

ReactDOM.render(<div style={{height: '60rem'}}>
<App />
</div>, mountNode);
````
