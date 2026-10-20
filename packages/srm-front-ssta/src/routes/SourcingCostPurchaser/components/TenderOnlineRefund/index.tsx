import React, { useMemo, useCallback, useEffect, Fragment } from 'react';
import { DataSet, Form, NumberField, Spin } from 'choerodon-ui/pro';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import type { Record as DSRecord } from 'choerodon-ui/dataset';

import intl from 'utils/intl';

import { tenderOnlineRefundDS } from './storeDS';
import DynamicAlert from '../../../Components/DynamicAlert';

interface TenderOnlineRefundProps {
  modal?: any,
  tenderRecord: DSRecord | null | undefined,
  okCallback: Function,
}

const TenderOnlineRefund = (props: TenderOnlineRefundProps) => {

  const { modal, tenderRecord, okCallback } = props;

  const tenderOnlineRefundDs = useMemo<DataSet>(() => new DataSet(tenderOnlineRefundDS()), []);

  const handleSubmit = useCallback(async () => {
    const res = await tenderOnlineRefundDs.submit();
    if (!res) return false;
    if (okCallback) okCallback();
  }, [tenderOnlineRefundDs, okCallback]);

  useEffect(() => {
    if (modal) modal.handleOk(handleSubmit);
    if (tenderRecord) {
      const recordData = tenderRecord.toData();
      const { paidAmount } = recordData;
      tenderOnlineRefundDs.loadData([{ ...recordData, onlineRefundAmount: paidAmount }]);
    }
  }, [modal, handleSubmit, tenderRecord, tenderOnlineRefundDs]);

  if (!tenderRecord) return <Spin />;

  return (
    <Fragment>
      <DynamicAlert
        placement='modal-top'
        message={intl
          .get(`ssta.sourcingCost.view.message.tenderOnlineRefundAlert`)
          .d('若招标文件费通过在线支付（支付宝、微信）缴纳，可通过【退款】按钮可将缴费金额原路退款')}
      />
      <Form
        columns={1}
        useColon={false}
        dataSet={tenderOnlineRefundDs}
        labelLayout={LabelLayout.float}
      >
        <NumberField name="onlineRefundAmount" />
      </Form>
    </Fragment>
  );
};

export default TenderOnlineRefund;