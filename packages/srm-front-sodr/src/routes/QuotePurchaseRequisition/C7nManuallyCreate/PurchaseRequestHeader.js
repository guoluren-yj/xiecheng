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
  Output,
  Select,
  TextArea,
  TextField,
  NumberField,
  DateTimePicker,
} from 'choerodon-ui/pro';
import { compose } from 'lodash';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';
import { formatAumont } from '@/routes/components/utils';

const BasicInfo = (props) => {
  const { ds, customizeForm } = props;
  const {
    supplierId,
    poHeaderId,
    returnOrderFlag,
    sourceOfTransferOrder,
    enableSupplierSiteFlag,
    ouId: newOuId,
  } =
    ds?.current?.get([
      'enableSupplierSiteFlag',
      'supplierId',
      'poHeaderId',
      'returnOrderFlag',
      'originalPoNum',
      'poSourcePlatform',
      'sourceOfTransferOrder',
      'ouId',
    ]) || {};
  const { ouId, purchaseOrgId, currencyCode, domesticCurrencyCode } = ds.getState('response') || {};
  const ouIdRenderer = <Lov name="ouId" disabled={poHeaderId && ouId} />;
  const purchaseOrgIdRenderer = <Lov name="purchaseOrgId" disabled={poHeaderId && purchaseOrgId} />;
  const agentIdRenderer = <Lov name="agentId" />;
  const currencyCodeRenderer = <Lov name="currencyCode" disabled={poHeaderId && currencyCode} />;
  const dosCurrencyCodeRenderer = (
    <Lov newLine name="domesticCurrencyCode" disabled={poHeaderId && domesticCurrencyCode} />
  );

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
      <Lov
        name="tempKey"
        tableProps={{ queryBarProps: { defaultShowMore: true } }}
        textField="supplierCompanyId"
      />
      {purchaseOrgIdRenderer}
      {agentIdRenderer}
      {currencyCodeRenderer}
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
      {returnOrderFlag && <Lov name="originalPoHeaderId" disabled />}
      <Select name="sourceBillTypeCode" disabled />
      {/* {poHeaderId && poSourcePlatform === 'CATALOGUE' && <TextField name="shipToLocationAddress" />}
      {poHeaderId && poSourcePlatform === 'CATALOGUE' && <TextField name="billToLocationAddress" />} */}
      {!!sourceOfTransferOrder && <Output name="sourceOfTransferOrder" />}
      <Lov
        newLine
        name="settleTempKey"
        placeholder={intl.get('sodr.workspace.model.common.settleSupplierId').d('结算供应商')}
      />
      <TextField name="supplierOrderTypeCode" disabled />
      <TextArea name="remark" newLine colSpan={2} rows={3} resize="vertical" />
      {dosCurrencyCodeRenderer}
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
      {enableSupplierSiteFlag === 1 && supplierId && newOuId && (
        <Lov newLine name="supplierSiteId" />
      )}
    </Form>
  );
};

export default compose(observer)(BasicInfo);
