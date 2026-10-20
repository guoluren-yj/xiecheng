import React from 'react';

import intl from 'utils/intl';

import ComContent from './ConfigModal/ComContent';
import CommonTable from './ConfigModal/commonTable';

export default function CataTables(props) {
  return (
    <div style={{ height: 'calc(100vh - 250px)', overflow: 'auto' }}>
      <ComContent title={intl.get('small.common.model.invoiceMethod').d('开票方式')}>
        <CommonTable
          activeKey={props.activeKey}
          record={props.record}
          onDSRef={props.onDSRef}
          readOnly={props.editFlag}
          lookupCode="SMAL.CATA_INVOICE_METHOD"
          valueType="INVOICE_METHOD"
          DSName="cataInvoiceMethodDS"
          title={intl.get('small.common.model.invoiceMethod').d('开票方式')}
          customizedCode="SMAL.CATA_PAYMENT.INVOICEMETHOD"
        />
      </ComContent>
      <ComContent title={intl.get('small.common.model.invoiceForm').d('发票形式')}>
        <CommonTable
          activeKey={props.activeKey}
          record={props.record}
          onDSRef={props.onDSRef}
          readOnly={props.editFlag}
          lookupCode="SMAL.INVOICE_TITLE"
          valueType="INVOICE_TITLE"
          DSName="cataInvoiceTitleDS"
          title={intl.get('small.common.model.invoiceForm').d('发票形式')}
          customizedCode="SMAL.CATA_PAYMENT.INVOICEFORM"
        />
      </ComContent>
      <ComContent title={intl.get('small.common.model.invoiceTypes').d('发票类型')}>
        <CommonTable
          activeKey={props.activeKey}
          record={props.record}
          onDSRef={props.onDSRef}
          readOnly={props.editFlag}
          lookupCode="SMAL.INVOICE_TYPE"
          valueType="INVOICE_TYPE"
          DSName="cataInvoiceTypeDS"
          title={intl.get('small.common.model.invoiceTypes').d('发票类型')}
          customizedCode="SMAL.CATA_PAYMENT.INVOICETYPES"
        />
      </ComContent>
      <ComContent title={intl.get('small.common.model.invoiceDetails').d('发票明细')}>
        <CommonTable
          activeKey={props.activeKey}
          record={props.record}
          onDSRef={props.onDSRef}
          readOnly={props.editFlag}
          lookupCode="SMAL.INVOICE_CONTENT"
          valueType="INVOICE_DETAIL"
          DSName="cataInvoiceDetailDS"
          title={intl.get('small.common.model.invoiceDetails').d('发票明细')}
          customizedCode="SMAL.CATA_PAYMENT.INVOICEDETAIL"
        />
      </ComContent>
    </div>
  );
}
