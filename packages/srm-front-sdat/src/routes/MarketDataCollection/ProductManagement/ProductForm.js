/**
 * 2026-02-10 ProductForm.js
 * 商品管理表单组件
 * Author: Felix(LQX5731@163.com)
 * Version: 1.0.0
 * Last Update: 2026-02-10
 */
import React from 'react';
import { Form, TextField, Cascader, IntlField } from 'choerodon-ui/pro';

export default function ProductForm({ dataSet, editMode }) {
  const handleSelectTree = value => {
    // value 是一个数组，例如 ['HUOBI1', 'HUOBI_RMB']，分别对应一级、二级等分类的 valueField
    if (Array.isArray(value) && value.length > 0) {
      const optionsDs = dataSet.getField('categoryTree').getOptions();

      // 根据 value 数组中的值，依次查找对应的记录
      const pathRecords = value.map(code => optionsDs.find(r => r.get('categoryCode') === code));

      dataSet.current.set({
        oneCategory: pathRecords[0] ? pathRecords[0].get('categoryCode') : undefined,
        twoCategory: pathRecords[1] ? pathRecords[1].get('categoryCode') : undefined,
        threeCategory: pathRecords[2] ? pathRecords[2].get('categoryCode') : undefined,
      });
    } else {
      dataSet.current.set({
        oneCategory: undefined,
        twoCategory: undefined,
        threeCategory: undefined,
      });
    }
  };

  return (
    <Form dataSet={dataSet} labelLayout="float">
      <TextField name="commodityCode" disabled={editMode} addonBefore="CUX_GD_" />
      <IntlField name="commodityName" />
      <Cascader name="categoryTree" onChange={handleSelectTree} />
      <TextField name="remark" type="multipleLine" showLengthInfo />
    </Form>
  );
}
