import React, { useMemo, useCallback, useEffect, Fragment } from 'react';
import { DataSet, Form, NumberField, Spin } from 'choerodon-ui/pro';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import type { Record as DSRecord } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import notification from 'utils/notification';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import { tenderPayConfirmDS } from './storeDS';
import DynamicAlert from '../../../Components/DynamicAlert';

interface TenderPayConfirmProps {
  modal?: any,
  tenderRecord: DSRecord | null | undefined,
  okCallback: Function,
  customizeForm: Function,
}

export const TenderPayConfirmCode = 'SSTA.TENDER_DETAIL_PUR.PAY_CONFIRM';

const TenderPayConfirm = withCustomize({
  unitCode: [TenderPayConfirmCode],
})((props: TenderPayConfirmProps) => {

  const { modal, tenderRecord, customizeForm, okCallback } = props;

  const tenderPayConfirmDs = useMemo<DataSet>(() => new DataSet(tenderPayConfirmDS()), []);

  const handleSubmit = useCallback(async () => {
    const res = await tenderPayConfirmDs.submit();
    if (!res) return false;
    const { errorFlag, errorMessage } = res.content?.[0] || {};
    if (errorFlag) {
      notification.error({ description: errorMessage });
    } else {
      notification.success({});
      if (okCallback) okCallback();
    }
  }, [tenderPayConfirmDs, okCallback]);

  useEffect(() => {
    if (modal) modal.handleOk(handleSubmit);
    if (tenderRecord) {
      const recordData = tenderRecord.toData();
      const { amount } = recordData;
      tenderPayConfirmDs.loadData([{ ...recordData, paymentAmount: amount, dataSource: 'SRM' }]);
    }
  }, [modal, handleSubmit, tenderRecord, tenderPayConfirmDs]);

  if (!tenderRecord) return <Spin />;

  return (
    <Fragment>
      <DynamicAlert
        placement='modal-top'
        message={intl
          .get(`ssta.sourcingCost.view.message.tenderPayConfirmAlert`)
          .d('招标文件费缴纳确认后，将修改「招标文件费缴纳状态」为「已缴纳」，请确认供应商已缴纳完成')}
      />
      {customizeForm(
        { code: TenderPayConfirmCode },
        <Form
          columns={1}
          useColon={false}
          dataSet={tenderPayConfirmDs}
          labelLayout={LabelLayout.float}
        >
          <NumberField name="paymentAmount" />
        </Form>
      )}
    </Fragment>
  );
});

export default TenderPayConfirm;