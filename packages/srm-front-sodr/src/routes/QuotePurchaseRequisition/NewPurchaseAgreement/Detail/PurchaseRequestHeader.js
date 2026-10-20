import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { Form, Lov, TextArea, TextField, DateTimePicker, NumberField } from 'choerodon-ui/pro';
import { Store } from './stores';
import { formatAumont } from '@/routes/components/utils';

function supplierRenderer({ record, value }) {
  return value || record.get('supplierCompanyName');
}

function poSourcePlatformRenderer({ value }) {
  return value || 'SRM';
}

const PurchaseRequestHeader = function PurchaseRequestHeader() {
  const { headerDs, header, customizeForm } = useContext(Store);
  const { purchaseOrgId } = headerDs.current?.get(['purchaseOrgId']) || {};
  return customizeForm(
    {
      code: 'SODR.ORDER_CREATE_LINE_LIST.HEADER_BY_REQUEST',
      __force_record_to_update__: true,
    },
    <Form dataSet={headerDs} columns={3} labelLayout="float">
      <Lov name="poTypeId" />
      <TextField name="displayPoNum" disabled />
      <DateTimePicker name="creationDate" disabled />
      <Lov name="companyName" disabled />
      {<Lov name="ouId" disabled={headerDs.getState('response')?.ouId} />}
      <Lov name="supplierName" renderer={supplierRenderer} disabled />
      <Lov
        name="purchaseOrgId"
        disabled={headerDs.getState('response')?.purchaseOrgId && purchaseOrgId}
      />
      {<Lov name="agentId" />}
      <Lov name="currencyCode" disabled />
      <NumberField
        name="taxIncludeAmount"
        disabled
        renderer={({ value }) => (
          <span>{formatAumont(value, headerDs?.current?.get('financialPrecision'), true)}</span>
        )}
      />
      <NumberField
        name="amount"
        disabled
        renderer={({ value }) => (
          <span>{formatAumont(value, headerDs?.current?.get('financialPrecision'), true)}</span>
        )}
      />
      <Lov name="termsId" />
      <NumberField name="quantityTotal" disabled />
      <TextField name="poSourcePlatformMeaning" renderer={poSourcePlatformRenderer} disabled />
      <TextField name="sourceBillTypeCodeMeaning" disabled />
      <Lov name="domesticCurrencyCode" disabled />
      <NumberField
        name="domesticTaxIncludeAmount"
        disabled
        renderer={({ value }) => (
          <span>
            {formatAumont(value, headerDs?.current?.get('domesticFinancialPrecision'), true)}
          </span>
        )}
      />
      <NumberField
        name="domesticAmount"
        disabled
        renderer={({ value }) => (
          <span>
            {formatAumont(value, headerDs?.current?.get('domesticFinancialPrecision'), true)}
          </span>
        )}
      />
      <TextField name="supplierOrderTypeCode" disabled />
      <Lov newLine name="settleTempKey" />
      {header.get('enableSupplierSiteFlag') === 1 &&
        header.get('supplierId') &&
        header.get('ouId')?.ouId && <Lov name="supplierSiteId" />}
      <TextArea name="remark" resize="vertical" />
    </Form>
  );
};

export default observer(PurchaseRequestHeader);
