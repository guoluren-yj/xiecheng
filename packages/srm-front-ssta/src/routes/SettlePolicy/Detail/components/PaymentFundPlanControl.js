import React, { useEffect, useContext, memo, useMemo } from 'react';
import { useDataSet, Select } from 'choerodon-ui/pro';

import EditorForm from '@/routes/Components/EditorForm';
import { paymentFundPlanControlDS } from '@/stores/SettleStrategyDS';
import { Store } from '../StoreProvider';

/**
 * @description: 资金计划管控
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

  const paymentFundPlanControlDs = useDataSet(
    () => ({
      ...paymentFundPlanControlDS(platModalFlag),
      events: {
        update: handleUpdate,
      },
    }),
    [platModalFlag]
  );

  useEffect(() => {
    paymentFundPlanControlDs.setQueryParameter('settleConfigId', settleConfigId);
    paymentFundPlanControlDs.query();
    modal.handleOk(async () => {
      emitChangeModals(modalName);
      const res = await paymentFundPlanControlDs.submit();
      return res;
    });
  }, [modal, settleConfigId, paymentFundPlanControlDs, emitChangeModals, modalName]);

  const eidtorColumns = useMemo(() => {
    return [
      { name: 'sourceTypeCode', editor: Select },
      { name: 'expectPaymentDateInitRule', editor: Select },
      { name: 'paymentLineDefaultAmount', editor: Select },
    ];
  }, []);

  return (
    <EditorForm
      columns={1}
      useColon={false}
      editorFlag={editFlag}
      dataSet={paymentFundPlanControlDs}
      editorColumns={eidtorColumns}
    />
  );
});
