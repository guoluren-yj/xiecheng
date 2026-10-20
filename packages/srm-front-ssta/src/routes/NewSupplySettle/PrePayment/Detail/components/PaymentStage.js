import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import SearchBarTable from '_components/SearchBarTable';
import { Select, Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import { reMatchStageLinePrepaymentSupplier } from '@/services/settlePoolServices';
import { getResponse } from 'utils/utils';

import {
  paymentStageCode,
  paymentStageLineCode,
  paymentStageRefundCode,
  paymentStageLineRefundCode,
} from '..';

const { Option } = Select;

const PaymentStage = observer((props) => {
  const { readOnlyFlag, customizeTable, paymentStageDs, headerDS, getSaveSendData, lineDS } = props;
  const [paymentStageTypeCustom, setPaymentStageTypeCustom] = useState('PAYMENT_STAGE');
  const { settleStatus, refundStatus } =
    headerDS?.current?.get(['settleStatus', 'refundStatus']) || {};

  const customCodeMap = useMemo(() => {
    if (refundStatus === 'REFUND') {
      return {
        PAYMENT_STAGE: paymentStageRefundCode,
        PAYMENT_STAGE_LINE: paymentStageLineRefundCode,
      };
    }
    return {
      PAYMENT_STAGE: paymentStageCode,
      PAYMENT_STAGE_LINE: paymentStageLineCode,
    };
  }, [refundStatus]);

  useEffect(() => {
    paymentStageDs.setQueryParameter('paymentStageTypeCustom', 'PAYMENT_STAGE');
  }, [paymentStageDs]);

  const handleStageTypeChange = useCallback(
    (value) => {
      setPaymentStageTypeCustom(value);
      paymentStageDs.setQueryParameter('paymentStageTypeCustom', value);
    },
    [paymentStageDs]
  );

  const handleUpdateStage = useCallback(async () => {
    const sendData = await getSaveSendData();
    if (!sendData) return;
    const res = getResponse(await reMatchStageLinePrepaymentSupplier(sendData));
    if (!res) return;
    paymentStageDs.query();
    headerDS.query(undefined, undefined, true);
    lineDS.query(undefined, undefined, true);
  }, [headerDS, paymentStageDs, getSaveSendData, lineDS]);

  const columns = useMemo(() => {
    if (paymentStageTypeCustom === 'PAYMENT_STAGE') {
      return [
        {
          name: 'lineNum',
          width: 80,
        },
        {
          name: 'stageDocumentAndLineNum',
          width: 180,
          renderer: ({ value, record }) => {
            const { displaySourceDocNum = '', displaySourceDocLineNum = '' } = record?.get(['displaySourceDocNum', 'displaySourceDocLineNum']) || {};
            return displaySourceDocNum ? `${displaySourceDocNum}${displaySourceDocLineNum && '-'}${displaySourceDocLineNum || ''}` : value;
          },
        },
        {
          name: 'stageNum',
          width: 100,
        },
        {
          name: 'stageDesc',
          width: 120,
        },
        {
          name: 'stageAmount',
          width: 100,
        },
        refundStatus !== 'REFUND' && {
          name: 'paymentAmount',
          width: 140,
          help: intl
            .get('ssta.purchaseSettle.model.prePayment.docPaymentAmountTips')
            .d(
              '预付款行「预付款行金额」，分摊至编制确认明细行的「本次实际付款金额」后，按「阶段」维度汇总的「本次实际付款金额」'
            ),
        },
        refundStatus === 'REFUND' && {
          name: 'enablePaymentAmount',
          title: intl
            .get('ssta.purchaseSettle.model.prePayment.refundedStagePayAmount')
            .d('被退款阶段付款金额'),
          width: 150,
        },
        refundStatus === 'REFUND' && {
          name: 'paymentAmount',
          title: intl.get('ssta.purchaseSettle.model.prePayment.refundAmount').d('本次退款金额'),
          width: 140,
        },
        refundStatus === 'REFUND' && {
          name: 'remainPaymentAmount',
          width: 160,
        },
        {
          name: 'prepPaymentAmount',
          width: 140,
        },
        {
          name: 'paymentOccupyAmount',
          width: 140,
        },
        refundStatus !== 'REFUND' && {
          name: 'enablePaymentAmount',
          width: 140,
        },
        refundStatus === 'REFUND' && {
          name: 'orgPaymentAmount',
          width: 140,
          title: intl.get('ssta.purchaseSettle.model.prePayment.docAbleAmount').d('可付款金额'),
        },
        {
          name: 'prepLatestPaymentDate',
          width: 180,
        },
        {
          name: 'prepLastPaymentDate',
          width: 180,
        },
        {
          name: 'shareFlag',
          title:
            refundStatus === 'REFUND'
              ? intl.get('ssta.purchaseSettle.model.prePayment.thisRefund').d('本次退款')
              : undefined,
          width: 140,
          renderer: ({ value }) => yesOrNoRender(Number(value)),
        },
        refundStatus === 'BE_REFUNDED' && {
          name: 'sumRefundCompletedPaymentAmount',
          width: 150,
        },
        refundStatus === 'BE_REFUNDED' && {
          name: 'orgPaymentAmount',
          width: 150,
        },
      ];
    } else {
      return [
        {
          name: 'lineNum',
          width: 80,
        },
        {
          name: 'prepDocumentAndLineNum',
          width: 180,
          renderer: ({ value, record }) => {
            const { displaySourceDocNum = '', displaySourceDocLineNum = '' } = record?.get(['displaySourceDocNum', 'displaySourceDocLineNum']) || {};
            return displaySourceDocNum ? `${displaySourceDocNum}${displaySourceDocLineNum && '-'}${displaySourceDocLineNum || ''}` : value;
          },
        },
        {
          name: 'stageNum',
          width: 120,
        },
        {
          name: 'stageDesc',
          width: 160,
        },
        refundStatus !== 'REFUND' && {
          name: 'paymentAmount',
          width: 140,
          help: intl
            .get('ssta.purchaseSettle.model.prePayment.docPaymentAmountLineTips')
            .d(
              '预付款行「预付款行金额」，按「关联单据编号-行号」匹配「条款来源单据编号」，结合编制确认明细行「可付款金额」「编制确认日期（由近到远）」，分摊至对应明细行的「本次实际付款金额」'
            ),
        },
        refundStatus === 'REFUND' && {
          name: 'enablePaymentAmount',
          title: intl
            .get('ssta.purchaseSettle.model.prePayment.refundedStagePayAmount')
            .d('被退款阶段付款金额'),
          width: 150,
        },
        refundStatus === 'REFUND' && {
          name: 'paymentAmount',
          title: intl.get('ssta.purchaseSettle.model.prePayment.refundAmount').d('本次退款金额'),
          width: 140,
        },
        refundStatus === 'REFUND' && {
          name: 'remainPaymentAmount',
          width: 160,
        },
        {
          name: 'prepPaymentAmount',
          width: 140,
        },
        {
          name: 'paymentOccupyAmount',
          width: 140,
        },
        refundStatus !== 'REFUND' && {
          name: 'enablePaymentAmount',
          width: 140,
        },
        refundStatus === 'REFUND' && {
          name: 'orgPaymentAmount',
          width: 140,
          title: intl.get('ssta.purchaseSettle.model.prePayment.docAbleAmount').d('可付款金额'),
        },
        {
          name: 'prepPaymentDate',
          width: 160,
        },
        {
          name: 'shareFlag',
          title:
            refundStatus === 'REFUND'
              ? intl.get('ssta.purchaseSettle.model.prePayment.thisRefund').d('本次退款')
              : undefined,
          width: 140,
          renderer: ({ value }) => yesOrNoRender(Number(value)),
        },
        {
          name: 'prepRelationNum',
          width: 250,
        },
        refundStatus === 'BE_REFUNDED' && {
          name: 'sumRefundCompletedPaymentAmount',
          width: 150,
        },
        refundStatus === 'BE_REFUNDED' && {
          name: 'orgPaymentAmount',
          width: 150,
        },
      ];
    }
  }, [refundStatus, paymentStageTypeCustom]);

  const buttons = useMemo(() => {
    return [
      refundStatus === 'NO_REFUND' &&
        paymentStageTypeCustom === 'PAYMENT_STAGE' &&
        ['NEW', 'RETURN'].includes(settleStatus) && (
          <Button icon="update" key="updateStage" name="updateStage" onClick={handleUpdateStage}>
            {intl
              .get('ssta.purchaseSettle.model.prePayment.updateStageInfo')
              .d('更新阶段信息并重新分摊付款金额')}
          </Button>
        ),
    ];
  }, [paymentStageTypeCustom, handleUpdateStage, settleStatus, refundStatus]);

  return customizeTable(
    {
      code: customCodeMap[paymentStageTypeCustom].LIST,
      readOnly: readOnlyFlag,
    },
    <SearchBarTable
      key={customCodeMap[paymentStageTypeCustom].SEARCH} // 同一个ds对应不同筛选器
      columns={columns}
      dataSet={paymentStageDs}
      style={{ maxHeight: 620 }}
      buttons={buttons}
      searchCode={customCodeMap[paymentStageTypeCustom].SEARCH}
      searchBarConfig={{
        closeFilterSelector: true,
        right: {
          render: () => (
            <div>
              <Select
                clearButton={false}
                value={paymentStageTypeCustom}
                onChange={handleStageTypeChange}
              >
                <Option value="PAYMENT_STAGE">
                  {intl
                    .get('ssta.purchaseSettle.model.prePayment.viewPaymentStage')
                    .d('按阶段聚合展示')}
                </Option>
                <Option value="PAYMENT_STAGE_LINE">
                  {intl
                    .get('ssta.purchaseSettle.model.prePayment.viewPaymentLineStage')
                    .d('按阶段明细展示')}
                </Option>
              </Select>
            </div>
          ),
        },
      }}
    />
  );
});

export default PaymentStage;
