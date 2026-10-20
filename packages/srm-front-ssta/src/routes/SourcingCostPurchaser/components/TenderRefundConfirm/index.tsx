import React, { useMemo, useCallback, useEffect, Fragment } from 'react';
import { DataSet, Form, NumberField, Spin } from 'choerodon-ui/pro';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import type { Record as DSRecord } from 'choerodon-ui/dataset';

import intl from 'utils/intl';

import { tenderRefundConfirmDS } from './storeDS';
import DynamicAlert from '../../../Components/DynamicAlert';

interface TenderRefundConfirmProps {
  modal?: any,
  tenderRecord: DSRecord | null | undefined,
  okCallback: Function,
}

const TenderRefundConfirm = (props: TenderRefundConfirmProps) => {

  const { modal, tenderRecord, okCallback } = props;

  const tenderRefundConfirmDs = useMemo<DataSet>(() => new DataSet(tenderRefundConfirmDS()), []);

  const handleSubmit = useCallback(async () => {
    const res = await tenderRefundConfirmDs.submit();
    if (!res) return false;
    if (okCallback) okCallback();
  }, [tenderRefundConfirmDs, okCallback]);

  useEffect(() => {
    if (modal) modal.handleOk(handleSubmit);
    if (tenderRecord) {
      const recordData = tenderRecord.toData();
      const { amount } = recordData;
      tenderRefundConfirmDs.loadData([{ ...recordData, offlineRefundAmount: amount }]);
    }
  }, [modal, handleSubmit, tenderRecord, tenderRefundConfirmDs]);

  if (!tenderRecord) return <Spin />;

  return (
    <Fragment>
      <DynamicAlert
        placement='modal-top'
        message={intl
          .get(`ssta.sourcingCost.view.message.tenderRefundConfirmAlert`)
          .d('招标文件费退款确认后，将修改「招标文件费缴纳状态」为「已退款」，请确认已退款完成')}
      />
      <Form
        columns={1}
        useColon={false}
        dataSet={tenderRefundConfirmDs}
        labelLayout={LabelLayout.float}
      >
        <NumberField name="offlineRefundAmount" />
      </Form>
    </Fragment>
  );
};

export default TenderRefundConfirm;