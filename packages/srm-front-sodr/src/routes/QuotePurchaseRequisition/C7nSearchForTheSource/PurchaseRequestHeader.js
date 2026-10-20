/*
 * BasicInfo - 订单明细页-基础信息
 * @date: 2021/05/13 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React from 'react';
import {
  Lov,
  Form,
  Select,
  TextArea,
  TextField,
  NumberField,
  DateTimePicker,
} from 'choerodon-ui/pro';
import { compose } from 'lodash';
import { observer } from 'mobx-react-lite';
import { formatAumont } from '@/routes/components/utils';

const BasicInfo = (props) => {
  const { ds, customizeForm } = props;
  const {
    supplierId,
    originalPoNum,
    sourceOfTransferOrder,
    enableSupplierSiteFlag,
    ouId,
    purchaseOrgId,
  } =
    ds?.current?.get([
      'supplierId',
      'originalPoNum',
      'sourceOfTransferOrder',
      'enableSupplierSiteFlag',
      'ouId',
      'purchaseOrgId',
    ]) || {};
  // const companyIdField = ds.current?.getField('companyId');
  // const companyIdDirty = companyIdField?.dirty;
  // ouId有值，且companyId未变动展示文本
  const ouIdRenderer = (
    <Lov
      name="ouId"
      disabled={ds.getState('companyIdChange') !== 1 && ds.getState('response')?.ouId}
    />
  );
  const purchaseOrgIdRenderer = (
    <Lov name="purchaseOrgId" disabled={ds.getState('response')?.purchaseOrgId && purchaseOrgId} />
  );

  const agentIdRenderer = <Lov name="agentId" />;

  return customizeForm(
    {
      code: 'SODR.ORDER_CREATE_LINE_LIST.HEADER_BY_REQUEST',
      __force_record_to_update__: true,
      lovIgnore: false,
    },
    <Form dataSet={ds} columns={3} labelLayout="float">
      <Lov name="poTypeId" />
      <TextField name="displayPoNum" disabled />
      <DateTimePicker name="creationDate" disabled />
      <Lov name="companyId" />
      {ouIdRenderer}
      <Lov name="tempKey" disabled />
      {purchaseOrgIdRenderer}
      {agentIdRenderer}
      <Lov name="currencyCode" disabled />
      <NumberField
        name="taxIncludeAmount"
        disabled
        renderer={({ value }) => (
          <span>{formatAumont(value, ds?.current?.get('financialPrecision'), true)}</span>
        )}
      />
      <NumberField
        name="amount"
        disabled
        renderer={({ value }) => (
          <span>{formatAumont(value, ds?.current?.get('financialPrecision'), true)}</span>
        )}
      />
      <Lov name="termsId" />
      <NumberField name="quantityTotal" disabled />
      <Select name="poSourcePlatform" disabled />
      {originalPoNum && <Lov name="originalPoHeaderId" disabled />}
      {/* {returnOrderFlag && <TextField name="originalPoHeaderId" />} */}
      <Lov name="sourceBillTypeCode" disabled />
      {!!sourceOfTransferOrder && <Lov name="sourceOfTransferOrder" disabled />}
      <Lov newLine name="settleTempKey" />
      <TextField name="supplierOrderTypeCode" disabled />
      <TextArea name="remark" newLine colSpan={2} rows={3} resize="vertical" />
      <TextField newLine name="domesticCurrencyCode" disabled />
      <NumberField
        name="domesticTaxIncludeAmount"
        disabled
        renderer={({ value }) => (
          <span>{formatAumont(value, ds?.current?.get('domesticFinancialPrecision'), true)}</span>
        )}
      />
      <NumberField
        name="domesticAmount"
        disabled
        renderer={({ value }) => (
          <span>{formatAumont(value, ds?.current?.get('domesticFinancialPrecision'), true)}</span>
        )}
      />
      {enableSupplierSiteFlag === 1 && supplierId && ouId?.ouId && (
        <Lov newLine name="supplierSiteId" />
      )}
    </Form>
  );
};

export default compose(observer)(BasicInfo);
