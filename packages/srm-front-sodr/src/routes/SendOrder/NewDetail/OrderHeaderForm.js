import React, { useCallback, useContext } from 'react';
import { Form, Output, Spin, TextArea } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { yesOrNoRender } from 'utils/renderer';
import { Store } from './stores';
import { useAmountRenderer } from './hooks';

function supplierRenderer({ record }) {
  if (record) {
    const { supplierCode, supplierCompanyCode, supplierName, supplierCompanyName } = record.get([
      'supplierCode',
      'supplierCompanyCode',
      'supplierName',
      'supplierCompanyName',
    ]);
    return `${supplierCode || supplierCompanyCode || ''} ${
      supplierName || supplierCompanyName || ''
    }`;
  }
}

const OrderHeaderForm = function OrderHeaderForm() {
  const { headerDs, customizeForm, sourceFromCancel } = useContext(Store);
  const { current } = headerDs;
  const { poSourcePlatform, originalPoNum, sourceOfTransferOrder } = current
    ? current.get(['poSourcePlatform', 'originalPoNum', 'sourceOfTransferOrder'])
    : {};
  const amountRenderer = useAmountRenderer('financialPrecision');
  const amountRenderer2 = useAmountRenderer('domesticFinancialPrecision');
  const yesOrNoRenderer = useCallback(({ value }) => yesOrNoRender(value), []);
  const form = customizeForm(
    {
      code: sourceFromCancel
        ? 'SODR.ORDER_PROCESS_CONTROL_DETAIL.HEADER'
        : 'SODR.SEND_ORDER_DETAIL.HEADER',
      // afterCustomizeDs: () => {
      //   headerDs.query();
      // },
    },
    <Form
      dataSet={headerDs}
      columns={3}
      labelLayout="vertical"
      className="c7n-pro-vertical-form-display"
    >
      <Output name="displayPoNum" />
      <Output name="releaseNum" />
      <Output name="versionNum" />
      <Output name="amount" renderer={amountRenderer} />
      <Output name="taxIncludeAmount" renderer={amountRenderer} />
      <Output name="currencyCode" />
      <Output name="companyName" />
      <Output name="supplierId" renderer={supplierRenderer} />
      <Output name="supplierSiteName" />
      <Output name="poTypeDesc" />
      <Output name="purchaseOrgName" />
      <Output name="agentId" renderer={({ record }) => record.get('agentName')} />
      <Output name="releasedDate" />
      {poSourcePlatform !== 'CATALOGUE' && <Output name="shipToLocationAddress" />}
      {poSourcePlatform !== 'CATALOGUE' && <Output name="billToLocationAddress" />}
      <Output name="termsId" renderer={({ record }) => record.get('termsName')} newLine />
      <Output name="quantityTotal" />
      <Output
        name="poSourcePlatform"
        renderer={({ record }) => record.get('poSourcePlatformMeaning')}
      />
      {originalPoNum && <Output name="originalPoNum" />}
      <Output name="erpContractNum" />
      <Output name="domesticCurrencyCode" newLine />
      <Output name="domesticTaxIncludeAmount" renderer={amountRenderer2} />
      <Output name="domesticAmount" renderer={amountRenderer2} />
      <Output name="supplierOrderTypeCode" />
      {sourceFromCancel ? (
        <Output name="remark" colSpan={2} />
      ) : (
        <TextArea name="remark" rows={2} style={{ height: '56px' }} colSpan={2} resize="vertical" />
      )}
      {!!sourceOfTransferOrder && <Output name="sourceOfTransferOrder" />}
      <Output name="cooperationSupplierFlag" renderer={yesOrNoRenderer} newLine />
      <Output name="electricSignFlag" renderer={yesOrNoRenderer} newLine />
      <Output
        name="electricSignStatus"
        renderer={({ record }) => record.get('electricSignStatusMeaning')}
      />
      <Output
        name="electricSignOrder"
        renderer={({ record }) => record.get('electricSignOrderMeaning')}
      />
      <Output
        name="electricSignStage"
        renderer={({ record }) => record.get('electricSignStageMeaning')}
      />
      <Output name="pcNum" />
    </Form>
  );

  return <Spin dataSet={headerDs}>{form}</Spin>;
};

export default observer(OrderHeaderForm);
