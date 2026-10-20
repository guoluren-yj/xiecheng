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
  const { supplierId, sourceOfTransferOrder, enableSupplierSiteFlag, ouId } =
    ds?.current?.get([
      'supplierId',
      'originalPoNum',
      'poSourcePlatform',
      'enableSupplierSite',
      'enableSupplierSiteFlag',
      'sourceOfTransferOrder',
      'ouId',
    ]) || {};
  const {
    unSaveEnable,
    companyName,
    ouName,
    supplierName,
    supplierCompanyName,
    purchaseOrgName,
    currencyCode,
    // termsName,
    originalPoNum,
    domesticCurrencyCode,
  } = ds.getState('response') || {};
  const saved = unSaveEnable === 0;
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
      {<Lov name="companyId" disabled={saved && companyName} />}
      {<Lov name="ouId" disabled={saved && ouName} />}
      <Lov
        name="tempKey"
        tableProps={{ queryBarProps: { defaultShowMore: true } }}
        textField="supplierCompanyId"
        disabled={saved && (supplierName || supplierCompanyName)}
      />
      {<Lov name="purchaseOrgId" disabled={saved && purchaseOrgName} />}
      {<Lov name="agentId" />}
      {<Lov name="currencyCode" disabled={saved && currencyCode} />}
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
      <Select name="sourceBillTypeCode" disabled />
      {/* {poHeaderId && poSourcePlatform === 'CATALOGUE' && <TextField name="shipToLocationAddress" />} */}
      {/* {poHeaderId && poSourcePlatform === 'CATALOGUE' && <TextField name="billToLocationAddress" />} */}
      {!!sourceOfTransferOrder && <Select name="sourceOfTransferOrder" />}
      <Lov newLine name="settleTempKey" />
      <TextField name="supplierOrderTypeCode" />
      <TextArea name="remark" newLine colSpan={2} rows={3} resize="vertical" />
      <Lov newLine name="domesticCurrencyCode" disabled={saved && domesticCurrencyCode} />
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
