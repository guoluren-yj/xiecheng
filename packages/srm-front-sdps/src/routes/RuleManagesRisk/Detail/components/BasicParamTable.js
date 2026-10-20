/**
 * 规则配置详情 - 基本参数（平台级）
 * @date: 2021-12-20
 * @author: Zip <Zepeng.huang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Zhenyun
 */

import React, { useEffect } from 'react';
import { Form, TextField, Select, Lov, CheckBox, IntlField } from 'choerodon-ui/pro'; // NumberField

export default function BasicParamTable(props = {}) {
  const { formDs, ruleId, onTypeChange } = props;

  // const [disableRetEmpty, handleDisableRetEmpty] = useState(false); // 控制空参缺省值的disable

  /**
   * 当formDs.current变化时重新渲染
   */
  useEffect(() => {
    if (formDs) {
      formDs.create(
        {
          enableFlag: 0,
          ruleType: '0',
          chooseFlag: 1,
        },
        0
      );
    }
  }, []);

  /**
   * 根据defaultRetEmpty值确定retEmpty字段是否可编辑
   */
  // const handleDefaultRetEmptyChange = () => {
  //   if (formDs.current.get('defaultRetEmpty') !== 'empty_default') {
  //     formDs.current.set('retEmpty', null);
  //     handleDisableRetEmpty(true);
  //     return;
  //   }
  //   // 回复置空时要还原为原来的值
  //   formDs.current.set('retEmpty', formDs.current.getPristineValue('retEmpty'));
  //   handleDisableRetEmpty(false);
  // };

  return (
    <Form dataSet={formDs} labelLayout="float" columns={3}>
      {/* labelLayout="float" */}
      <TextField name="ruleCode" colSpan={1} disabled={ruleId} />
      <IntlField name="ruleName" colSpan={1} />
      <Select name="ruleType" colSpan={1} onChange={onTypeChange} disabled />
      <Lov name="themeObj" />
      <CheckBox name="chooseFlag" />
      <IntlField
        name="description"
        type="multipleLine"
        colSpan={3}
        newLine
        showLengthInfo
        rows={3}
      />
      {/* {formDs.current?.get('type') === '1' && (
        <Fragment>
          <Lov name="service" colSpan={1} />
          <TextField name="serviceCode" colSpan={1} disabled />
          <TextField name="servicePath" colSpan={1} disabled />
        </Fragment>
      )}
      {formDs.current?.get('type') !== '1' && <Select name="defaultRet" colSpan={1} />}
      <Select name="defaultRetLine" colSpan={1} />
      {formDs.current?.get('type') !== '1' && (
        <Fragment>
          <Select name="defaultRetEmpty" colSpan={1} onChange={handleDefaultRetEmptyChange} />
          <NumberField name="retEmpty" colSpan={1} disabled={disableRetEmpty} />
        </Fragment>
      )}
      <Select name="defaultRetFail" colSpan={1} />
      <TextArea name="description" colSpan={3} newLine /> */}
    </Form>
  );
}
