---
order: 4
title:
  zh-CN: 其他模式
  en-US: other mode
---

## zh-CN

其他模式。

## en-US

other mode.

```jsx
import { DataSet, Row, Col, Lov, Tree } from 'choerodon-ui/pro';
import { configure } from 'choerodon-ui';
configure({
  lovPatching: () => [
      {
        code: 'LOV_CODE',
        name: 'supplierChooseFlag',
        description: `选择“精确”时，将按照lov中所选供应商信息匹配与其一致的单据；选择“按平台或按本地供应商”时，将筛选包含该平台供应商或本地供应商的所有单据；例如，本地供应商a作为不协同供应商时，产生订单01。后续转化为协同供应商，关联平台供应商A，产生订单02。选择“精确”时，LOV中只能选到当前已经关联的“A&a”数据，只能查询到订单02；选择“按本地供应商”时，LOV中可以选到“a”本地供应商，可以查询出订单01和订单02。`,
        options: [
          {
            value: 0,
            meaning: '精确',
          },
          {
            value: 1,
            meaning: '按平台供应商',
          },
          {
            value: 2,
            meaning: '按本地供应商'
          },
        ],
      },
    ]
});

function nodeRenderer({ record }) {
  return record.get('text');
}

const App = () => {
  const ds = React.useMemo(
    () =>
      new DataSet({
        autoCreate: true,
        fields: [
          {
            name: 'popup_code',
            textField: 'code',
            type: 'object',
            lovCode: 'LOV_CODE',
            required: true,
            optionsProps: {
              queryParameter: {
                supplierChooseFlag: 1,
              }
            }
          },
          {
            name: 'popup_code_string',
            type: 'object',
            lovCode: 'LOV_CODE',
            multiple: true,
            defaultValue: [{ code: 'SYS.USER_STATUS11' }],
          },
          {
            name: 'drawer_code',
            textField: 'code',
            type: 'object',
            lovCode: 'LOV_CODE',
            multiple: true,
            required: true,
          },
          {
            name: 'drawer_code_string',
            textField: 'text',
            type: 'object',
            lovCode: 'LOV_TREE_CODE',
            multiple: true,
            required: true,
          },
        ],
      }),
    [],
  );

  const viewRenderer = React.useCallback(({ dataSet, lovConfig, textField, valueField, label, multiple }) => {
    console.log('info: ', dataSet, lovConfig, textField, valueField, label, multiple);
    const treeProps = {
      selectable: false,
      checkable: true,
      dataSet,
      renderer: nodeRenderer,
      multiple: true,
      showLine: {
        showLeafIcon: false,
      },
      defaultExpandAll: true,
    };
    return <Tree {...treeProps} />;
  }, []);

  return (
    <>
      <Row gutter={10}>
        <Col span={24}>POPUP MODE</Col>
      </Row>
      <Row gutter={10}>
        <Col span={12}>
          <Lov dataSet={ds} name="popup_code" viewMode="popup" />
        </Col>
        <Col span={12}>
          <Lov dataSet={ds} name="popup_code_string" viewMode="popup" />
        </Col>
      </Row>
      <Row gutter={10}>
        <Col span={24}>DRAWER MODE</Col>
      </Row>
      <Row gutter={10}>
        <Col span={12}>
          <Lov dataSet={ds} name="drawer_code" viewMode="drawer" />
        </Col>
        <Col span={12}>
          <Lov
            dataSet={ds}
            name="drawer_code_string"
            viewMode="drawer"
            selectionProps = {{
              nodeRenderer: (record) => {
                return (<a href={record.get('url')}>{record.get('text')}</a>);
              },
              placeholder: 'Please select the data on the left',
            }}
            viewRenderer={viewRenderer}
          />
        </Col>
      </Row>
    </>
  );
};

ReactDOM.render(<App />, mountNode);
```
