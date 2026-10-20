import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import { DataSet, Form, Lov, TextField } from 'choerodon-ui/pro';
import { settleHeaderDS } from '@/stores/NewPurchaseSettleDS';
import { unitValidate } from '@/utils/utils';
import { Store } from '../Detail/StoreProvider';

const FilledLogisticsInfo = (props) => {
  const { modal } = props;
  const { settleHeaderId, documentType, settleHeaderDs, custConfig, customizeForm } = useContext(
    Store
  );
  const filledLogisticsInfoDs = useMemo(
    () => new DataSet(settleHeaderDS(settleHeaderId, documentType)),
    [settleHeaderId, documentType]
  );

  const handleOk = useCallback(async () => {
    const okFlag = await unitValidate(
      filledLogisticsInfoDs,
      custConfig['SSTA.PURCHASE_SETTLE_DETAIL.INV_LOGISTICS'],
      ['logisticsCompanyLov', 'logisticsNum', 'logisticsPhoneNum']
    );
    if (!okFlag) return false;
    const res = await filledLogisticsInfoDs
      .setState('submitType', 'updateLogisticsInfo')
      .forceSubmit();
    if (!res) return false;
    settleHeaderDs.query();
  }, [filledLogisticsInfoDs, custConfig, settleHeaderDs]);

  useEffect(() => {
    filledLogisticsInfoDs.setState('logisticsFilledFlag', true);
    filledLogisticsInfoDs.create(settleHeaderDs.current.toData());
    modal.handleOk(handleOk);
  }, [filledLogisticsInfoDs, modal, handleOk]);

  return customizeForm(
    { code: 'SSTA.PURCHASE_SETTLE_DETAIL.INV_LOGISTICS' },
    <Form columns={1} labelLayout="float" dataSet={filledLogisticsInfoDs}>
      <Lov name="logisticsCompanyLov" />
      <TextField name="logisticsNum" />
      <TextField name="logisticsPhoneNum" />
    </Form>
  );
};

export default FilledLogisticsInfo;
