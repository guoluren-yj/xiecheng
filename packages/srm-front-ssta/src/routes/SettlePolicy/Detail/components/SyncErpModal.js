/*
 * @Description: 结算策略详情-对账开票付款同步ERP设置
 * @Date: 2022-01-20 14:44:10
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { useEffect, useContext, memo, useMemo } from 'react';
import { useDataSet, Select, CheckBox } from 'choerodon-ui/pro';

import { yesOrNoRender } from 'utils/renderer';

import { syncErpDS } from '@/stores/SettleStrategyDS';
import { Store } from '../StoreProvider';
import EditorForm from '@/routes/Components/EditorForm';

const handleUpdate = ({ record, name, value }) => {
  if (name === 'erpCancelType') {
    record.set({
      partSynchronizeErpCancelFlag: 0,
      cancelSynchronizeErpFlag: value === 'SRM' ? 1 : 0,
    });
  } else if (name === 'billErpSyncNode') {
    record.set('billReturnCancelFlag', 0);
  } else if (name === 'cancelSynchronizeErpFlag') {
    if (Number(value) === 0) {
      record.set({
        cancelSyncMethod: null,
      });
    }
  }
};

/**
 * @description: 对账开票付款同步ERP设置
 * @param {Object} props
 * @return {*}
 */
export default memo(({ modal, name: modalName }) => {
  const { editFlag, activeKey, settleConfigId, platModalFlag, emitChangeModals } = useContext(
    Store
  );

  const syncErpDs = useDataSet(() => syncErpDS(activeKey, platModalFlag), [
    activeKey,
    platModalFlag,
  ]);


  useEffect(() => {
    syncErpDs.addEventListener('update', handleUpdate);
    syncErpDs.setQueryParameter('settleConfigId', settleConfigId);
    syncErpDs.query();
    modal.handleOk(async () => {
      emitChangeModals(modalName);
      const res = await syncErpDs.submit();
      return res;
    });
    return () => {
      syncErpDs.removeEventListener('update', handleUpdate);
    };
  }, [modal, settleConfigId, syncErpDs, emitChangeModals, modalName]);

  const editorColumns = useMemo(() => {
    return [
      ['invoice'].includes(activeKey) && { name: 'confirmSyncMethod', editor: Select },
      ['bill'].includes(activeKey) && { name: 'billErpSyncNode', editor: Select },
      { name: 'erpCancelType', editor: Select },
      {
        name: 'cancelSynchronizeErpFlag',
        editor: CheckBox,
        renderer: ({ value }) => yesOrNoRender(Number(value)),
      },
      ['bill'].includes(activeKey) && {
        name: 'billReturnCancelFlag',
        editor: CheckBox,
        renderer: ({ value }) => yesOrNoRender(Number(value)),
      },
      activeKey === 'invoice' && {
        name: 'partSynchronizeErpCancelFlag',
        editor: CheckBox,
        renderer: ({ value }) => yesOrNoRender(Number(value)),
      },
      ['invoice'].includes(activeKey) && { name: 'cancelSyncMethod', editor: Select },
      ['payment'].includes(activeKey) && {
        name: 'zeroAmountWithoutSyncFlag',
        editor: CheckBox,
        renderer: ({ value }) => yesOrNoRender(Number(value)),
      },
    ];
  }, [activeKey]);

  return (
    <EditorForm
      columns={1}
      useColon={false}
      dataSet={syncErpDs}
      editorFlag={editFlag}
      editorColumns={editorColumns}
    />
  );
});
