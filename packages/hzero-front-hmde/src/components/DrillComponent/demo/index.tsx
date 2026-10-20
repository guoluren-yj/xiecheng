/* eslint-disable no-template-curly-in-string */
import React, { useMemo } from 'react';
import { Header, Content } from 'components/Page';
import { Button, DataSet, Form, Output } from 'choerodon-ui/pro';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';

import DrillComponent from '@/components/DrillComponent';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';

const demo = () => {
  // const renderer = () => <Button color={ButtonColor.primary}>钻取</Button>;

  const drillRenderer = () => {
    return (
      <DrillComponent
        onOk={handleOk}
        name="drill"
        // initValue="'${user.qw:user.xl1}'" // 后端存储值, 初始值
        businessObjectCode="=m7RKsfgF0XXEuFTF7rsElTY3rG1f18kGrEufOfz0rRo=="
        // curFieldCode="xl1"
        // readOnly
      />
    );
  };

  const demoDs = useMemo(() => {
    return new DataSet({
      autoCreate: true,
      fields: [
        {
          name: 'drill',
          type: FieldType.string,
          label: '钻取 - 初始',
          required: true,
        },
      ],
    } as DataSetProps);
  }, []);

  /**
   * 弹窗关闭回调
   * @param dataSet 当前钻取组件的dataSet
   */
  const handleOk = (params) => {
    // demo测试的log
    /**
     * params: {
     *  dataSet,
     *  text,
     *  value,
     *  result,
     *
     * }
     */
    console.log(params);
    // eslint-disable-next-line no-unused-expressions
    demoDs?.current?.set('drill', params?.value);
  };

  const handleSave = () => {
    console.log('传给后端的值', demoDs?.current?.toData());
  };

  return (
    <>
      <Header title="钻取">
        <Button onClick={handleSave} color={ButtonColor.primary}>
          保存
        </Button>
      </Header>
      <Content>
        <Form dataSet={demoDs} labelWidth={200} columns={3}>
          <Output name="drill" renderer={drillRenderer} />
        </Form>
      </Content>
    </>
  );
};

export default demo;
