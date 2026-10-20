import React, { useMemo, useCallback, useEffect, Fragment } from 'react';
import { flow } from 'lodash';
import { DataSet, Form, CheckBox, Spin } from 'choerodon-ui/pro';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import type { Record as DSRecord } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import { depositProgressCtrlDS } from './storeDS';
import DynamicAlert from '../../../Components/DynamicAlert';

export const DepositProgressCtrlCode = 'SSTA.DEPOSIT_DETAIL_PUR.SOURCING_PROGRESS_CTRL';

interface DepositProgressCtrlProps {
  modal?: any,
  depositRecord: DSRecord | null | undefined,
  okCallback: Function,
  customizeForm?: any,
}

const DepositProgressCtrl = flow(
  withCustomize({
    unitCode: [DepositProgressCtrlCode],
  })
)((props: DepositProgressCtrlProps) => {

  const { modal, depositRecord, okCallback, customizeForm } = props;

  const depositProgressCtrlDs = useMemo<DataSet>(() => new DataSet(depositProgressCtrlDS(depositRecord)), [depositRecord]);

  const handleSubmit = useCallback(async () => {
    const res = await depositProgressCtrlDs.submit();
    if (!res) return false;
    if (okCallback) okCallback();
  }, [depositProgressCtrlDs, okCallback]);

  useEffect(() => {
    if (modal) modal.handleOk(handleSubmit);
  }, [modal, handleSubmit]);

  if (!depositRecord) return <Spin />;

  return (
    <Fragment>
      <DynamicAlert
        placement='modal-top'
        message={intl
          .get(`ssta.sourcingCost.view.message.depositProgressCtrlAlert`)
          .d('系统默认通过缴纳状态限制供应商报价，若由于异常原因导致缴纳状态无法及时更新（如，外部系统支付结果更新存在延迟），可通过本按钮允许对应供应商无需校验缴纳状态，亦可进行报价')}
      />
      {customizeForm(
        { code: DepositProgressCtrlCode },
        <Form
          columns={1}
          useColon={false}
          dataSet={depositProgressCtrlDs}
          labelLayout={LabelLayout.float}
        >
          <CheckBox name="supplierQuoteFlag" />
        </Form>
      )}
    </Fragment>
  );
});

export default DepositProgressCtrl;