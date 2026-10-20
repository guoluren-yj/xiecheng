/*
 * @Description: file content
 * @Date: 2022-02-09 01:03:55
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */

import React, { useContext } from 'react';
import { isNil } from 'lodash';
import { observer } from 'mobx-react';
import { Form, TextArea } from 'choerodon-ui/pro';
import intl from 'utils/intl';

import { FormItem } from '@/routes/Components';
import { formItemRender } from '@/utils/renderer';
import { Store } from '../Detail/StoreProvider';
import { statusTagRender } from '@/routes/Components/StatusTag';

const formCodes = {
  INVOICE: 'SSTA.PURCHASE_SETTLE_DETAIL.INV_BASE',
  PAYMENT: 'SSTA.PURCHASE_SETTLE_DETAIL.PAY_BASE',
};

export default observer(() => {
  const {
    settleType,
    updateFlag,
    cancelFlag,
    approveFlag,
    settleStatus,
    readOnlyFlag,
    documentType,
    customizeForm,
    settleHeaderDs,
    remoteProps,
    notPub,
    isReadOnly,
  } = useContext(Store);
  const newLine = true;
  const disabledOnlyProps = { editorDisabled: updateFlag };
  const {
    invoiceMatchRuleCode,
    directInvoicingType,
    invoiceRefundedReason,
    invoiceSettleCancelFlag,
  } =
    settleHeaderDs.current?.get([
      'invoiceMatchRuleCode',
      'directInvoicingType',
      'invoiceRefundedReason',
      'invoiceSettleCancelFlag',
    ]) || {};

  const basicCuszReadOnly = remoteProps
    ? remoteProps.process('SSTA_PURCHASESETTLE_DETAIL_BASIC_CUSZ_READONLY', readOnlyFlag, {
        notPub,
        isReadOnly,
        settleType,
        documentType,
        settleHeaderDs,
      })
    : readOnlyFlag;

  return customizeForm(
    {
      code: formCodes[documentType],
      readOnly: basicCuszReadOnly,
      __force_record_to_update__: true,
    },
    <Form
      useWidthPercent
      dataSet={settleHeaderDs}
      useColon={false}
      columns={3}
      labelLayout={updateFlag ? 'float' : 'vertical'}
    >
      <FormItem
        name="settleStatus"
        disabled={updateFlag}
        renderer={updateFlag ? ({ text }) => text : statusTagRender}
      />
      <FormItem name="companyNum" disabled={updateFlag} />
      <FormItem name="companyName" disabled={updateFlag} />
      <FormItem name="supplierCompanyNum" disabled={updateFlag} />
      <FormItem name="supplierCompanyName" disabled={updateFlag} />
      <FormItem name="campMeaning" disabled={updateFlag} />
      <FormItem name="createdUserName" disabled={updateFlag} />
      <FormItem name="createdUnitLov" editor="lov" editable={updateFlag} />
      <FormItem name="creationDate" disabled={updateFlag} />
      <FormItem name="sourceSupplierCompanyNum" disabled={updateFlag} />
      <FormItem name="sourceSupplierCompanyName" disabled={updateFlag} />
      <FormItem name="ouName" disabled={updateFlag} />
      <FormItem name="supplierSiteCode" disabled={updateFlag} />
      <FormItem name="unitName" disabled={updateFlag} />
      <FormItem
        name="remark"
        editor="textarea"
        newLine
        colSpan={2}
        resize="vertical"
        editable={updateFlag}
        placeholder={
          settleType === 'INVOICE' &&
          invoiceMatchRuleCode === 'DIRECT_INVOICING' &&
          directInvoicingType === 'EC'
            ? intl
                .get('ssta.purchaseSettle.model.purchaseSettle.placeholder.remark')
                .d(
                  '当前第三方电商仅支持接收40个字符，您如果维护超长，系统将在提交给第三方的时候自动截取，超长字符仅可在srm查看'
                )
            : ''
        }
      />
      {formItemRender({
        newLine,
        name: 'purInvoiceHeader',
        visible: ['INVOICE', 'INVOICE_PAYMENT'].includes(settleType),
        ...disabledOnlyProps,
      })}
      {formItemRender({
        name: 'purTaxRegistrationNumber',
        visible: ['INVOICE', 'INVOICE_PAYMENT'].includes(settleType),
        ...disabledOnlyProps,
      })}
      {formItemRender({
        newLine,
        name: 'enableChargeDebitFlag',
        visible: ['INVOICE'].includes(settleType),
        ...disabledOnlyProps,
      })}
      {formItemRender({
        name: 'canceledReason',
        editor: TextArea,
        newLine: true,
        colSpan: 2,
        resize: 'vertical',
        editorDisabled: updateFlag,
        visible:
          ![
            'NEW',
            'RETURN',
            'SUBMITED',
            'SUBMITED_APPROVING',
            'WAIT_SUPPLIER_CONFIRM',
            'ES_SUBMITED_APPROVING',
          ].includes(settleStatus) && !cancelFlag,
      })}
      {formItemRender({
        name: 'invoiceRefundedReason',
        editor: TextArea,
        newLine: true,
        colSpan: 2,
        resize: 'vertical',
        editorable: updateFlag,
        // 当单据状态=直连开票异常 或 直连开票成功 且 发票匹配规则=直连开票 且 直连开票节点=电商 且 票单同步取消=是时,显示可编辑
        visible:
          (updateFlag &&
            ['INVOICE_EXCEPTION', 'INVOICE_SUCCESS'].includes(settleStatus) &&
            invoiceMatchRuleCode === 'DIRECT_INVOICING' &&
            directInvoicingType === 'EC' &&
            Number(invoiceSettleCancelFlag) === 1) ||
          (!cancelFlag && !isNil(invoiceRefundedReason)),
      })}
      {formItemRender({
        name: 'approvedRemark',
        editor: TextArea,
        newLine: true,
        colSpan: 2,
        resize: 'vertical',
        editorDisabled: updateFlag,
        visible: settleStatus !== 'NEW' && !(settleStatus === 'SUBMITED' && approveFlag),
      })}
      {formItemRender({
        name: 'canceledRemark',
        editor: TextArea,
        newLine: true,
        colSpan: 2,
        resize: 'vertical',
        editorDisabled: updateFlag,
        visible:
          ![
            'NEW',
            'RETURN',
            'SUBMITED',
            'SUBMITED_APPROVING',
            'INVOICE_EXCEPTION',
            'INVOICE_FAILED',
            'ES_SUBMITED_APPROVING',
            'WAIT_SUPPLIER_CONFIRM',
          ].includes(settleStatus) && !(settleStatus === 'CANCELING' && approveFlag),
      })}
      {formItemRender({
        name: 'documentCreationType',
        visible: ['INVOICE', 'INVOICE_PAYMENT'].includes(settleType),
        ...disabledOnlyProps,
      })}
      {formItemRender({
        name: 'sourceSystemDocumentNum',
        visible: ['INVOICE', 'INVOICE_PAYMENT'].includes(settleType),
        ...disabledOnlyProps,
      })}
      {formItemRender({
        name: 'thirdEcInvoiceNum',
        visible:
          ['INVOICE', 'INVOICE_PAYMENT'].includes(settleType) &&
          invoiceMatchRuleCode === 'DIRECT_INVOICING' &&
          directInvoicingType === 'EC',
        ...disabledOnlyProps,
      })}
      {formItemRender({
        name: 'paymentStatus',
        visible: ['INVOICE'].includes(settleType),
        ...disabledOnlyProps,
      })}
      {formItemRender({
        name: 'importPayPlatformFlag',
        visible: ['PAYMENT'].includes(settleType),
        ...disabledOnlyProps,
      })}
      {remoteProps ? (
        remoteProps.process('SSTA_PURCHASESETTLE_DETAIL_FORM_FIELD', '', {
          formDs: settleHeaderDs,
          labelLayout: updateFlag ? 'float' : 'vertical',
          readOnly: basicCuszReadOnly || !updateFlag,
        })
      ) : (
        <></>
      )}
    </Form>
  );
});
