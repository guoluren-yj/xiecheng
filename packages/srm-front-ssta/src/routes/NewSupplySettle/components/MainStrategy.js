/*
 * @Description: file content
 * @Date: 2022-02-09 01:03:55
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */

import React, { useContext, Fragment } from 'react';
import { Form, Output } from 'choerodon-ui/pro';
import { isNil } from 'lodash';

import intl from 'utils/intl';

import { Store } from '../Detail/StoreProvider';

export default () => {
  const {
    settleType,
    readOnlyFlag,
    documentType,
    customizeForm,
    settleHeaderDs,
    payAreaShow,
  } = useContext(Store);

  return (
    <Fragment>
      {customizeForm(
        {
          code:
            documentType === 'INVOICE'
              ? 'SSTA.SUPPLY_SETTLE_DETAIL_MAIN_INFO.TOP'
              : 'SSTA.SUPPLY_SETTLE_DETAIL_MAIN_INFO.PAY_TOP',
          readOnly: readOnlyFlag,
        },
        <Form dataSet={settleHeaderDs} columns={3} useColon={false} labelLayout="vertical">
          <Output name="settleConfigNum" />
          <Output name="settleConfigName" />
          <Output name="configVersionNumber" />
          <Output name="confirmCollaborativeModeMeaning" />
          <Output name="confirmApproveMethodMeaning" />
          <Output name="invoiceMatchMeaning" />
          <Output name="cancelCollaborativeModeMeaning" />
          <Output name="cancelApproveMethodMeaning" />
          {documentType === 'INVOICE' && (
            <Output
              name="invoiceToleranceRangeLimit"
              renderer={({ value, record }) =>
                !isNil(value) && record?.get('invoiceAllowanceCtrlType') === 'PROPORTION'
                  ? `${value}%`
                  : value
              }
            />
          )}
          {documentType === 'INVOICE' && (
            <Output
              name="taxAmountTolLimit"
              renderer={({ value, record }) =>
                !isNil(value) && record?.get('invoiceAllowanceCtrlType') === 'PROPORTION'
                  ? `${value}%`
                  : value
              }
            />
          )}
          {documentType === 'INVOICE' && <Output name="amountValidateLevelMeaning" />}
          {documentType === 'INVOICE' && <Output name="amountValidateAction" />}
          {documentType === 'INVOICE' && <Output name="amountAdjustFlag" />}
          {documentType === 'INVOICE' && (
            <Output
              name="amountAdjustTolLimit"
              renderer={({ value, record }) =>
                !isNil(value) && record?.get('invoiceAllowanceCtrlType') === 'PROPORTION'
                  ? `${value}%`
                  : value
              }
            />
          )}
          {documentType === 'INVOICE' && (
            <Output
              name="taxAmountAdjustTolLimit"
              renderer={({ value, record }) =>
                !isNil(value) && record?.get('invoiceAllowanceCtrlType') === 'PROPORTION'
                  ? `${value}%`
                  : value
              }
            />
          )}
          {documentType === 'INVOICE' && <Output name="amountAdjustModeMeaning" />}
          {documentType === 'INVOICE' && <Output name="amountAdjustRuleMeaning" />}
        </Form>
      )}
      {customizeForm(
        {
          code:
            documentType === 'INVOICE'
              ? 'SSTA.SUPPLY_SETTLE_DETAIL_MAIN_INFO.BOTTOM'
              : 'SSTA.SUPPLY_SETTLE_DETAIL_MAIN_INFO.PAY_BOTTOM',
          readOnly: readOnlyFlag,
        },
        <Form
          dataSet={settleHeaderDs}
          columns={3}
          useColon={false}
          labelLayout="vertical"
          style={{ marginTop: 16 }}
        >
          <Output name="defaultPaymentDimensionMeaning" />
          <Output name="defaultPaymentSpliteRuleMeaning" />
          <Output name="defaultPrepaymentSpliteRuleMeaning" />
          <Output
            name="lineLimitQuantity"
            renderer={({ value, record }) => {
              return record?.get('enableLineLimitFlag')
                ? value
                : intl.get(`ssta.supplySettle.model.supplySettle.noLimit`).d('无限制');
            }}
          />
          {payAreaShow && <Output name="prepaymentDimensionMeaning" />}
          {payAreaShow && <Output name="prepaymentCheckLevel" />}
          {payAreaShow && <Output name="prepaymentCheckPoint" />}
          {payAreaShow && <Output name="autoApplyPayAmountRuleCode" />}
          {payAreaShow && <Output name="autoApplyPrepaymentRuleCode" />}
          <Output name="initSettleConfigNum" />
          <Output name="initConfigVersionNumber" />
          {settleType !== 'PAYMENT' && <Output name="invoiceUxFlag" />}
          {settleType === 'PAYMENT' && <Output name="paymentUxFlag" />}
          {settleType === 'INVOICE_PAYMENT' && <Output name="invoicePaymentUxFlag" />}
          {documentType === 'INVOICE' && <Output name="enableChargeDebitFlag" />}
          {settleType === 'PAYMENT' && <Output name="paymentControlRuleSource" />}
          {settleType === 'PAYMENT' && <Output name="expectPaymentDateInitRule" />}
        </Form>
      )}
    </Fragment>
  );
};
