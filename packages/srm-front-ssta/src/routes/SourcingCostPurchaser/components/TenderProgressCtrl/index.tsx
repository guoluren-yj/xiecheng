import React, { useMemo, useCallback, useEffect, Fragment } from 'react';
import { flow } from 'lodash';
import { DataSet, Form, CheckBox, Spin } from 'choerodon-ui/pro';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import type { Record as DSRecord } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import { tenderProgressCtrlDS } from './storeDS';
import DynamicAlert from '../../../Components/DynamicAlert';

export const TenderProgressCtrlCode = 'SSTA.TENDER_DETAIL_PUR.SOURCING_PROGRESS_CTRL';

interface TenderProgressCtrlProps {
  modal?: any,
  tenderRecord: DSRecord | null | undefined,
  okCallback: Function,
  customizeForm?: any,
}

const TenderProgressCtrl = flow(
  withCustomize({
    unitCode: [TenderProgressCtrlCode],
  })
)((props: TenderProgressCtrlProps) => {

  const { modal, tenderRecord, okCallback, customizeForm } = props;

  const tenderProgressCtrlDs = useMemo<DataSet>(() => new DataSet(tenderProgressCtrlDS(tenderRecord)), [tenderRecord]);

  const downloadNodeMeaning = tenderRecord?.get('downloadNodeMeaning');

  const handleSubmit = useCallback(async () => {
    const res = await tenderProgressCtrlDs.submit();
    if (!res) return false;
    if (okCallback) okCallback();
  }, [tenderProgressCtrlDs, okCallback]);

  useEffect(() => {
    if (modal) modal.handleOk(handleSubmit);
  }, [modal, handleSubmit]);

  if (!tenderRecord) return <Spin />;

  return (
    <Fragment>
      <DynamicAlert
        placement='modal-top'
        message={intl
          .get(`ssta.sourcingCost.view.message.tenderProgressCtrlAlert`, { downloadNodeMeaning })
          .d('系统通过缴纳/开票状态限制供应商下载标书/参与，若由于异常原因导致缴纳/开票状态无法及时更新（如，支付宝/微信支付结果更新存在延迟），可通过本按钮允许对应供应商无需校验缴纳/开票状态，亦可下载标书/参与。当前招标文件下载时点为：{downloadNodeMeaning}')}
      />
      {customizeForm(
        { code: TenderProgressCtrlCode },
        <Form
          columns={1}
          useColon={false}
          dataSet={tenderProgressCtrlDs}
          labelLayout={LabelLayout.float}
        >
          <CheckBox name="uuidDownloadFlag" />
          <CheckBox name="supplierParticipationFlag" />
        </Form>
      )}
    </Fragment>
  );
});

export default TenderProgressCtrl;