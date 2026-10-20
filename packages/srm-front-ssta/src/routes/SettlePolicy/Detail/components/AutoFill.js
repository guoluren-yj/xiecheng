/*
 * @Description: 结算策略详情-自动填单
 * @Date: 2022-07-07 14:44:10
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { memo, useContext, useEffect, useCallback } from 'react';
import { useDataSet, Form, Lov, Output } from 'choerodon-ui/pro';
import { Store } from '../StoreProvider';
import { autoFillDS } from '@/stores/SettleStrategyDS';

export default memo((props) => {
  const { documentType, modal } = props;
  const { editFlag, settleConfigId, platModalFlag } = useContext(Store);
  const autoFillDs = useDataSet(() => autoFillDS(documentType, settleConfigId, platModalFlag), [
    documentType,
    settleConfigId,
    platModalFlag,
  ]);

  useEffect(() => {
    modal.handleOk(handleSave);
  }, [modal, handleSave]);

  const handleSave = useCallback(async () => {
    const validateFlag = await autoFillDs.validate();
    if (!validateFlag) return false;
    const submitRes = await autoFillDs.submit();
    return submitRes;
  }, [autoFillDs]);

  return (
    <Form
      columns={1}
      useColon={false}
      dataSet={autoFillDs}
      labelLayout={editFlag ? 'float' : 'vertical'}
    >
      {editFlag ? <Lov name="templateLov" /> : <Output name="templateLov" />}
    </Form>
  );
});
