## 字段钻取组件 DrillComponent

### 一：如何使用

```tsx
import React, { useMemo, useState } from 'react';
import { Header, Content } from 'components/Page';
import { Button, DataSet, Form, Output } from 'choerodon-ui/pro';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';

import DrillComponent from '@/businessComponents/DrillComponent';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';

const demo = () => {
  // const renderer = () => <Button color={ButtonColor.primary}>钻取</Button>;

  const [value, setValue] = useState('');

  const drillRenderer = () => {
    return (
      <DrillComponent
        onOk={handleOk}
        text={value}
        businessObjectId="=xCdh0kUeLzhOhEHxu_zUD0t6woOxZImbQ5QnzCkPyLI=="
      />
    );
  };

  const demoDs = useMemo(() => {
    return new DataSet({
      autoCreate: true,
      fields: [
        {
          name: 'drill-1',
          type: FieldType.string,
          label: '钻取 - 自定义渲染',
        },
        {
          name: 'drill',
          type: FieldType.string,
          label: '钻取 - 初始',
        },
      ],
    } as DataSetProps);
  }, []);

  /**
   * 弹窗关闭回调
   * @param dataSet 当前钻取组件的dataSet
   */
  const handleOk = (dataSet) => {
    // demo测试的log
    console.log(
      '字段选择的数据',
      dataSet?.current?.toData(),
      '获取某个字段的下拉框options',
      dataSet?.current?.getField('1')?.options?.toData()
    );
    // 设置前端显示的值
    setValue('前端显示的值');
    // eslint-disable-next-line no-unused-expressions
    demoDs?.current?.set('drill', '传给后端的值');
  };

  const handleSave = () => {
    console.log('传给后端的值', demoDs?.current?.toData());
  };

  return (
    <>
      <Header title="钻取">
        <Button onClick={handleSave} color={ButtonColor.primary}>保存</Button>
      </Header>
      <Content>
        <Form dataSet={demoDs} labelWidth={200} columns={3}>
          <Output name='drill' renderer={drillRenderer} />
          {/* <DrillComponent
            onOk={handleOk}
            name="drill"
            businessObjectId="=xCdh0kUeLzhOhEHxu_zUD0t6woOxZImbQ5QnzCkPyLI=="
          /> */}
          {/* <DrillComponent
            title="钻取组件自定义标题"
            renderer={renderer}
            onOk={handleOk}
            name="drill-1"
            businessObjectId="=xCdh0kUeLzhOhEHxu_zUD0t6woOxZImbQ5QnzCkPyLI=="
          /> */}
        </Form>
      </Content>
    </>
  );
};

export default demo;



```

二： 组件属性

- title: 自定义弹窗标题
  
- renderer: 组件自定义渲染

- onOk: 弹窗关闭回调，自己去写前端回写的逻辑

- businessObjectId: 业务对象id，用于查询当前对象下的字段

- text: 前端显示的文本

```tsx
interface IProps {
  businessObjectId: string | number; // 当前业务对象id
  renderer?: () => ReactNode; // 自定义renderer
  onOk?: (dataSet: DataSet) => any; // 弹窗关闭回调
  name?: string; // dataSet中的name
  title?: string; // 自定义标题
  text?: string; // 前端回写的文本
}
```



