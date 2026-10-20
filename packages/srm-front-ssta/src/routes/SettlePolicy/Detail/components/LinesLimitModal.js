/*
 * @Description: 结算策略详情-对账开票付款行数控制弹框
 * @Date: 2022-01-20 14:44:10
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { useEffect, useContext, memo } from 'react';
import { useDataSet, Form } from 'choerodon-ui/pro';

import { FormItem } from '@/routes/Components';
import { linesLimitDS } from '@/stores/SettleStrategyDS';
import { Store } from '../StoreProvider';

/**
 * @description: 对账开票付款税务发票行数控制弹框，税务发票行数控制使用customKey
 * @param {Object} props
 * @return {ReactNode}
 */
export default memo(({ modal, name: modalName, customKey }) => {
  const { editFlag, activeKey, settleConfigId, platModalFlag, emitChangeModals } = useContext(
    Store
  );

  const linesLimitDs = useDataSet(() => linesLimitDS(customKey || activeKey, platModalFlag), [
    activeKey,
    platModalFlag,
    customKey,
  ]);

  useEffect(() => {
    linesLimitDs.setQueryParameter('settleConfigId', settleConfigId);
    linesLimitDs.query().then(() => {
      // 兼容 UX 改造前的保存接口
      linesLimitDs.current.set('enableFlag', 1);
    });
    modal.handleOk(async () => {
      emitChangeModals(modalName);
      const res = await linesLimitDs.submit();
      return res;
    });
  }, [linesLimitDs, modal, settleConfigId, emitChangeModals, modalName]);

  return (
    <Form
      columns={1}
      useColon={false}
      dataSet={linesLimitDs}
      labelLayout={editFlag ? 'float' : 'vertical'}
    >
      <FormItem name="limitQuantity" editable={editFlag} />
    </Form>
  );
});
