import React from 'react';

import intl from 'utils/intl';

import ComContent from './ComContent';
import InvoiceMethod from './invoiceMethod';
import CommonTable from './commonTable';
import FreightType from './freightType';

export default function ConfigModal(props) {
  return (
    <>
      <ComContent title={intl.get('small.common.model.invoiceMethod').d('开票方式')}>
        <InvoiceMethod activeKey={props.activeKey} record={props.record} onDSRef={props.onDSRef} />
      </ComContent>
      <ComContent title={intl.get('small.common.model.invoiceForm').d('发票形式')}>
        <CommonTable
          activeKey={props.activeKey}
          record={props.record}
          onDSRef={props.onDSRef}
          lookupCode="SMAL.INVOICE_TITLE"
          valueType="INVOICE_TITLE"
          DSName="invoiceTitleDS"
          title={intl.get('small.common.model.invoiceForm').d('发票形式')}
          customizedCode="SMAL.EC_PAYMENT.INVOICEFORM"
        />
      </ComContent>
      <ComContent title={intl.get('small.common.model.invoiceDetails').d('发票明细')}>
        <CommonTable
          activeKey={props.activeKey}
          record={props.record}
          onDSRef={props.onDSRef}
          lookupCode="SMAL.INVOICE_CONTENT"
          valueType="INVOICE_DETAIL"
          DSName="invoiceDetailDS"
          title={intl.get('small.common.model.invoiceDetails').d('发票明细')}
          customizedCode="SMAL.EC_PAYMENT.INVOICEDETAIL"
        />
      </ComContent>
      <ComContent title={intl.get('small.common.model.paymentMethod').d('支付方式')}>
        <CommonTable
          activeKey={props.activeKey}
          record={props.record}
          onDSRef={props.onDSRef}
          lookupCode="SMAL.PAYMENT_METHOD"
          valueType="PAYMENT_TYPE"
          DSName="paymentMethodDS"
          title={intl.get('small.common.model.paymentMethod').d('支付方式')}
          customizedCode="SMAL.EC_PAYMENT.PAYMENTMETHOD"
        />
      </ComContent>
      <ComContent title={intl.get('small.common.model.freightType').d('运费类型')}>
        <FreightType
          activeKey={props.activeKey}
          record={props.record}
          onDSRef={props.onDSRef}
          valueType="FREIGHT_TYPE"
        />
      </ComContent>
    </>
  );
}
