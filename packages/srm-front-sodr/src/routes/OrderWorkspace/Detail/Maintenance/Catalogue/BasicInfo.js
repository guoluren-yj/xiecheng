/*
 * BasicInfo - 订单明细页-基础信息
 * @date: 2021/05/13 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React from 'react';
import {
  Form,
  TextField,
  Lov,
  NumberField,
  DateTimePicker,
  Select,
  TextArea,
} from 'choerodon-ui/pro';
import { compose } from 'lodash';
import { observer } from 'mobx-react-lite';

const BasicInfo = (props) => {
  const { ds, customizeForm, oldTermHideFlag } = props;
  return customizeForm(
    {
      code: 'SODR.WORKSPACE_CATALOGUE_DETAIL.BASICINFO',
      __force_record_to_update__: true,
      lovIgnore: false,
    },
    <Form dataSet={ds} columns={3} labelLayout="float" useWidthPercent>
      <TextField name="displayPoNum" />
      <Lov name="poTypeId" />
      <NumberField name="amount" />
      <NumberField name="taxIncludeAmount" />
      <NumberField name="quantityTotal" />
      <Lov name="currencyCode" />
      <DateTimePicker name="creationDate" />
      <Select name="poSourcePlatform" />
      {!oldTermHideFlag && <Lov name="termsId" />}
      <TextArea name="remark" newLine colSpan={2} rows={3} resize="vertical" />
      {/* 默认隐藏字段 */}
      <Lov newLine name="domesticCurrencyCode" />
      <NumberField name="domesticTaxIncludeAmount" />
      <NumberField name="domesticAmount" />
      <Select name="sourceOfTransferOrder" />
      <Select name="sourceBillTypeCode" />
      <TextField name="supplierOrderTypeCode" />
      <Lov name="createdUnitId" />
    </Form>
  );
};

export default compose(observer)(BasicInfo);
