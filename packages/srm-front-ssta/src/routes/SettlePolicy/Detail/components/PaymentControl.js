import React, { useEffect, useContext, memo, useMemo } from 'react';
import { useDataSet, Select, CheckBox } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import EditorForm from '@/routes/Components/EditorForm';
import { paymentControlDS } from '@/stores/SettleStrategyDS';
import { Store } from '../StoreProvider';

/**
 * @description: 付款管控
 * @param {Object} props
 * @return {*}
 */
export default memo(({ modal, name: modalName }) => {
  const { editFlag, settleConfigId, platModalFlag, emitChangeModals } = useContext(Store);

  const handleUpdate = ({ name, record }) => {
    if (name === 'expectPaymentDateInitRule') {
      record.set('enablePredictExpectPaymentDate', undefined);
    }
  };

  const paymentControlDs = useDataSet(
    () => ({
      ...paymentControlDS(platModalFlag),
      events: {
        update: handleUpdate,
      },
    }),
    [platModalFlag]
  );

  useEffect(() => {
    paymentControlDs.setQueryParameter('settleConfigId', settleConfigId);
    paymentControlDs.query();
    modal.handleOk(async () => {
      emitChangeModals(modalName);
      const res = await paymentControlDs.submit();
      return res;
    });
  }, [modal, settleConfigId, paymentControlDs, emitChangeModals, modalName]);

  const eidtorColumns = useMemo(() => {
    return [
      { name: 'paymentControlRuleSource', editor: Select },
      { name: 'expectPaymentDateInitRule', editor: Select },
      {
        name: 'enablePredictExpectPaymentDate',
        editor: CheckBox,
        help: intl
          .get('ssta.settleStrategy.view.help.enablePredictExpectPaymentDate')
          .d(
            '启用后，在发票申请确认/付款申请提交/付款申请取消/手工点击可付款页面【更新预计期望付款日期】按钮时，根据付款计划中最新阶段日期计算公式逐一计算结算事务的期望付款日期，并按结算策略中「期望付款日期默认规则」配置的取值逻辑，更新基于发票申请创建付款申请、基于结算事务创建付款申请页面的「预计期望付款日期」字段'
          ),
        renderer: ({ value }) => yesOrNoRender(Number(value)),
      },
    ];
  }, []);

  return (
    <EditorForm
      columns={1}
      useColon={false}
      editorFlag={editFlag}
      dataSet={paymentControlDs}
      editorColumns={eidtorColumns}
    />
  );
});
