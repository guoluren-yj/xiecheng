import React, { useMemo, useCallback, useEffect, Fragment } from 'react';
import { Card } from 'choerodon-ui';
import { DataSet, Form, NumberField, Spin, TextArea } from 'choerodon-ui/pro';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import type { Record as DSRecord } from 'choerodon-ui/dataset';
import { ResizeType } from 'choerodon-ui/pro/lib/text-area/enum';

import intl from 'utils/intl';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import { payStatusConfirmDS } from './storeDS';

interface PayStatusConfirmProps {
  modal?: any,
  serviceRecord: DSRecord | null | undefined,
  okCallback: Function,
  customizeForm: Function,
}

export const payStatusConfirmOtherCode = 'SSTA.SERVICE_DETAIL_PUR.PAY_STATUS_CONFIRM_OTHER';

const PayStatusConfirm = withCustomize({
  unitCode: [payStatusConfirmOtherCode],
})((props: PayStatusConfirmProps) => {

  const { modal, serviceRecord, okCallback, customizeForm } = props;
  const payStatusConfirmDs = useMemo<DataSet>(() => new DataSet(payStatusConfirmDS()), []);

  const handleSubmit = useCallback(async () => {
    const res = await payStatusConfirmDs.submit();
    if (!res) return false;
    if (okCallback) okCallback();
  }, [payStatusConfirmDs, okCallback]);

  useEffect(() => {
    if (serviceRecord) {
      const recordData = serviceRecord.toData();
      const { remainingPaymentAmount } = recordData;
      payStatusConfirmDs.loadData([{ ...recordData, paymentAmount: remainingPaymentAmount }]);
    }
  }, [serviceRecord, payStatusConfirmDs]);

  useEffect(() => {
    if (modal) {
      modal.handleOk(handleSubmit);
      modal.update({ okProps: { disabled: false } });
    }
  }, [modal, handleSubmit]);

  if (!serviceRecord) return <Spin />;

  return (
    <Fragment>
      <Card
        key="amount"
        bordered={false}
        className={DETAIL_CARD_CLASSNAME}
        title={intl.get(`ssta.sourcingCost.view.title.amountInfo`).d('金额信息')}
      >
        <Form
          columns={2}
          useColon={false}
          dataSet={payStatusConfirmDs}
          labelLayout={LabelLayout.float}
        >
          <NumberField name="paymentAmount" />
        </Form>
      </Card>
      <Card
        key="other"
        bordered={false}
        className={DETAIL_CARD_CLASSNAME}
        title={intl.get(`ssta.sourcingCost.view.title.otherInfo`).d('其他信息')}
      >
        {customizeForm(
          { code: payStatusConfirmOtherCode },
          <Form
            columns={2}
            useColon={false}
            dataSet={payStatusConfirmDs}
            labelLayout={LabelLayout.float}
          >
            <TextArea name="remark" resize={ResizeType.vertical} />
          </Form>
        )}
      </Card>
    </Fragment>
  );
});

export default PayStatusConfirm;